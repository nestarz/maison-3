import xml2json from "./xml2json.js";
import path from "./path.js";

const sortByFn = k => ((a,b) => (a[k] > b[k]) ? 1 : ((b[k] > a[k]) ? -1 : 0)); 
export default (endpoint, folder = "") => {
  return fetch(path.join(endpoint, folder))
    .then(r => r.text())
    .then(xml => {
      const json = JSON.parse(xml2json(xml).replace(/\"D\:/g, '"'));
      return {
        current: folder,
        prev:
          folder && folder !== "/"
            ? new URL("..", path.join(endpoint, folder)).pathname
            : null,
        folders: json.multistatus.response
          .filter(o => !o.propstat.prop.getcontenttype)
          .map(({ propstat: { prop }, ...args }) => ({ ...prop, ...args }))
          .filter(({ href }) => href !== folder)
          .filter(({ displayname }) => displayname)
          .sort(({ displayname }) => displayname),
        files: json.multistatus.response
          .filter(o => o.propstat.prop.getcontenttype)
          .map(({ propstat: { prop }, ...args }) => ({ ...prop, ...args }))
          .sort(sortByFn('displayname'))
      };
    });
};