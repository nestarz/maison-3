import axios from "axios";

const NSFW_TIMEOUT = 3000;
const isNSFW = (url, strict = true) =>
  axios
    .post("http://localhost:8080/nsfw", [url], {
      timeout: NSFW_TIMEOUT
    })
    .then(({ data: { data: pred, error } }) => {
      if (error) return strict;
      const isNSFW =
        pred.Porn > 0.08 || pred.Neutral < 0.1 || pred.Hentai > 0.2;
      if (isNSFW) {
        return true;
      }
      return false;
    })
    .catch(err => console.log(err.toString().slice(0, 100)) || strict);

export default async (request, { strict = true }) => {
  const allowed = ["document", "stylesheet", "font"];
  const type = request.resourceType();
  if (allowed.includes(type)) {
    request.continue();
  } else if (type === "image") {
    const nsfw = await isNSFW(request.url(), strict);
    if (nsfw) {
      request.abort();
    } else {
      request.continue();
    }
  } else request.abort();
};
