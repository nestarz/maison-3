import fs from "fs";
import path from "path";
import Crawler from "simplecrawler";
import SocksProxyAgent from "socks-proxy-agent";
import tldExtract from "tld-extract";
import directory from "../assets/directory.json";
import slugify from "slugify";

const crawlerSettings = {
  httpAgent: new SocksProxyAgent("socks://localhost:9050"),
  scanSubdomains: false,
  filterByDomain: false,
  maxDepth: 1,
  maxConcurrency: 5,
  timeout: 5000,
  maxResourceSize: 1024 * 1024 * 2,
  downloadUnsupported: false,
  ignoreInvalidSSL: true,
  stripQuerystring: true,
  supportedMimeTypes: [
    /^text\//i,
    /^application\/(rss|html|xhtml)?[+/-]?xml/i,
    /^xml/i
  ]
};

function clean(_, resources) {
  console.log(resources);
}

function crawl(initialURL, outfile, parent) {
  const crawler = Object.assign(new Crawler(initialURL), crawlerSettings);
  const log = ({ referrer = initialURL, url }) => {
    fs.appendFileSync(
      outfile,
      JSON.stringify({
        id: slugify(url.replace("http://", "").replace(".onion/", "")),
        url,
        referrer,
        parent
      }) + "\n"
    );
  };

  crawler.addFetchCondition((queueItem, referrerQueueItem) => {
    if (referrerQueueItem.host === queueItem.host) return false;
    if (tldExtract(queueItem.url).tld !== "onion") {
      console.log("Referrer is not from the Dark Web, discarding...");
      return false;
    }
    return true;
  });

  return new Promise((resolve, reject) =>
    crawler
      .on("discoverycomplete", clean)
      .on("fetchcomplete", log)
      .on("complete", resolve)
      .on("fetchtimeout", ({ url }, timeout) =>
        console.log("fetchtimeout", url, timeout)
      )
      .start()
  );
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function argMax(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

const zip = (...arrs) =>
  arrs[argMax(arrs.map(arr => arr.length))].map((_, i) => [
    ...arrs.map(arr => arr[i] || null)
  ]);

async function main(outfile, { overwrite = false }) {
  if (overwrite && fs.existsSync(outfile)) fs.unlinkSync(outfile);
  if (!fs.existsSync(path.dirname(outfile)))
    fs.mkdirSync(path.dirname(outfile), { recursive: true });
  const directoryWithCat = shuffle(directory.onions).map(onion => ({
    ...onion,
    category: directory.categories[onion.category]
  }));
  const urlsByCat = directory.categories.map(category =>
    directoryWithCat.filter(onion => onion.category === category)
  );
  for (const urls of zip(...urlsByCat)) {
    for (const url of urls) {
      if (!url) continue;
      await crawl(`http://${url.address}.onion`, outfile, url).catch(
        console.error
      );
      console.log("Done", url.address, url.category);
    }
  }
}

main("./output/crawler/20200126.jsonl", { overwrite: false }).catch(
  console.error
);
