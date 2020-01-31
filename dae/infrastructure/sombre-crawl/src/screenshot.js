import fs from "fs";
import path from "path";
import split from "split";
import classify from "./classify";
import puppeteer from "puppeteer";
import tldExtract from "tld-extract";

function fetchJSONL(file) {
  const urls = [];
  return new Promise(resolve =>
    fs
      .createReadStream(file)
      .pipe(split(d => d && JSON.parse(d)))
      .on("data", d => d && urls.push(d))
      .on("error", console.error)
      .on("end", () => resolve(urls))
  );
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main(jsonlist, out) {
  if (!fs.existsSync(out)) fs.mkdirSync(out, { recursive: true });
  const screenshotPath = id => path.join(out, `${id}.png`);
  const domains = new Set();
  const urls = (await fetchJSONL(jsonlist))
    .filter(({ url }) => url.includes(".onion"))
    .filter(({ id }) => !fs.existsSync(screenshotPath(id)))
    .filter(({ url }) => !url.includes("porn"))
    .filter(({ url }) => {
      const domain = tldExtract(url).domain;
      if (!domains.has(domain)) {
        domains.add(domain);
        return true;
      }
      return false;
    });
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--proxy-server=socks5://localhost:9050"]
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  console.log(urls.length);
  for (const { url, id, parent } of shuffle(urls)) {
    page.removeAllListeners();
    page.on("request", request =>
      classify(request, { strict: parent.category === "Adult/Porn" })
    );
    console.log(id, parent.category);
    await page
      .goto(url, { waitUntil: "networkidle2", timeout: 10000 })
      .then(async () => {
        await timeout(800);
        await page.screenshot({ path: screenshotPath(id) });
        console.log("ok");
      })
      .catch(err => console.log(err.name))
  }
  browser.close();
}

main(
  path.join(process.cwd(), "output", "crawler", "20200126.jsonl"),
  path.join(process.cwd(), "output", "screenshot", "legal")
).catch(err => console.error(err, "\nEnded."));
