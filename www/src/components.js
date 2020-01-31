import path from "/www/utils/path.js";

const html = (str, ...args) =>
  str
    .map((e, i) => [e, args[i]])
    .flat()
    .join("");

export const PreviewHTML = url =>
  html`
    <iframe src="${url}"></iframe>
  `;

export const Preview = files =>
  html`
    <div class="container ◊">
      ${files
        .map(file => {
          if (file.getcontenttype.includes("image/")) {
            return html`
              <div tabindex="0" class="image-container">
                <img src="${file.href}" />
              </div>
            `;
          }
        })
        .join("")}
    </div>
  `;

export const Parent = prev =>
  prev &&
  html`
    <li>
      🔙
      <span class="parent link" onclick="browseRender('${prev}')">${prev}</span>
    </li>
  `;

export const Folders = folders =>
  folders
    .filter(folder => folder.href !== "/www/")
    .map(
      folder =>
        html`
          <li>
            📁
            <span class="link" onclick="browseRender('${folder.href}')"
              >${folder.displayname}</span
            >
          </li>
        `
    )
    .join("");

export const Files = files =>
  files
    .map(
      file =>
        html`
          <li>
            📄
            <a href="${path.join("/", file.href)}" target="_blank"
              >${file.displayname}</a
            >
          </li>
        `
    )
    .join("");
