const path = require("path");
const fs = require("fs");

const buildPathReact = "./dist/";
const buildPathTarget = "./build/";
const exiapiPath = "./plugin-ads/exitapi.js";
const dapiPath = "./plugin-ads/dapi.js";
const mraidFixPath = "./plugin-ads/fixmraid.js";
const mindworkApiPath = "./plugin-ads/mindworkapi.js";
const tiktokApiPath = "./plugin-ads/playable-sdk.js";
const ironsourceApiPath = "./plugin-ads/ironsource_api.js";

let args = process.argv.slice(2);
let adsNetwork;
if (typeof args[0] == undefined) {
  adsNetwork = "google";
} else {
  adsNetwork = args[0];
}

console.log(`Build html file for ads network ${adsNetwork}\n`);

buildInlineHTML();

async function buildInlineHTML() {
  if (!fs.existsSync(buildPathTarget))
    fs.mkdirSync(buildPathTarget, { recursive: true });

  let htmlFileContent = await fs.promises.readFile(
    `${buildPathReact}index.html`,
    "utf8"
  );
  // Remove CSS & favicon
  htmlFileContent = htmlFileContent.replace(/<link(.+?)\/>/gs, "");

  // Đảm bảo chỉ còn 1 thẻ <meta charset="UTF-8" />
  htmlFileContent = htmlFileContent.replace(
    /<meta\s+charset=["'][^"']*["']\s*\/?>/gi,
    '<meta charset="UTF-8" />'
  );

  // Thay thế nội dung thẻ viewport nếu có
  if (htmlFileContent.match(/<meta\s+name=["']viewport["'][^>]*>/i)) {
    htmlFileContent = htmlFileContent.replace(
      /<meta\s+name=["']viewport["'][^>]*>/i,
      `<meta name="viewport" content="width=device-width,user-scalable=no,initial-scale=1.0, minimum-scale=1.0,maximum-scale=1.0"/>`
    );
  } else {
    // Nếu không có thì thêm ngay sau <meta charset>
    htmlFileContent = htmlFileContent.replace(
      /(<meta\s+charset=["'][^"']*["']\s*\/?>)/i,
      `$1\n<meta name="viewport" content="width=device-width,user-scalable=no,initial-scale=1.0, minimum-scale=1.0,maximum-scale=1.0"/>`
    );
  }

  if (adsNetwork == "google") {
    console.log(`--- Add google ads script`);
    // htmlFileContent = await addScriptSourceToHTML(htmlFileContent, 'https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js', 'head')

    let dapiContent = await fs.promises.readFile(`${exiapiPath}`, "utf8");
    htmlFileContent = await addScriptContentToHTML(
      htmlFileContent,
      dapiContent
    );
  }

  if (adsNetwork == "ironsource") {
    console.log(`--- Add ironsources ads script`);
    let dapiContent = await fs.promises.readFile(`${dapiPath}`, "utf8");
    htmlFileContent = await addScriptContentToHTML(
      htmlFileContent,
      dapiContent
    );
    let apiContent2 = await fs.promises.readFile(
      `${ironsourceApiPath}`,
      "utf8"
    );
    htmlFileContent = await addScriptContentToHTML(
      htmlFileContent,
      apiContent2
    );
  }

  if (adsNetwork == "unity" || adsNetwork == "applovin") {
    console.log(`--- Fix mraid For Unity & Applovin script`);
    let mraidFixContent = await fs.promises.readFile(`${mraidFixPath}`, "utf8");
    htmlFileContent = await addScriptContentToHTML(
      htmlFileContent,
      mraidFixContent
    );
  }

  if (adsNetwork == "mindwork") {
        // [THÊM MỚI] Chỉ sửa lỗi CORS/Module riêng cho Mindworks tại đây
    console.log(`--- Patching specific for Mindworks (Fix CORS Error)`);
    
    // 1. Xóa type="module" để biến thành script thường
    htmlFileContent = htmlFileContent.replace(/type=["']module["']/g, '');
    
    // 2. Xóa crossorigin
    htmlFileContent = htmlFileContent.replace(/crossorigin/g, '');
    
    // 3. Xóa các thẻ preload module thừa (nếu có) để cho sạch
    // htmlFileContent = htmlFileContent.replace(/<link rel=["']modulepreload["'].*?>/g, '');

    console.log(`--- Add mindwork ads script`);
    let apiContent = await fs.promises.readFile(`${mindworkApiPath}`, "utf8");
    htmlFileContent = await addScriptContentToHTML(htmlFileContent, apiContent);
  }

  if (adsNetwork == "tiktok") {
    console.log(`--- Add tiktok ads script`);
    let apiContent = await fs.promises.readFile(`${tiktokApiPath}`, "utf8");
    htmlFileContent = await addScriptContentToHTML(
      htmlFileContent,
      apiContent,
      "body"
    );
  }

  htmlFileContent = await addScriptContentToHTML(
    htmlFileContent,
    `${injectCustomScript.toString()};injectCustomScript();`,
    "body"
  );
  htmlFileContent = htmlFileContent.replace(/<\/script><script>/g, ";");

  // add this to the end to increase confusion while reading html file
  //htmlFileContent = await addScriptContentToHTML(htmlFileContent, await bundleAssetToScript(), 'body')

  console.log("\n");

  htmlFileContent = htmlFileContent.replace(/<\/script><script>/g, ";");
  await fs.promises.writeFile(
    `${buildPathTarget}index_${adsNetwork}.html`,
    htmlFileContent,
    "utf8"
  );
  console.log(`Output saved to: ${buildPathTarget}index_${adsNetwork}.html`);

  // const minifyOptions = {
  //     html: {
  //         removeOptionalTags: false
  //     },
  // };
  // const minifyFileContent = await minify(`${buildPathTarget}index-full.html`, minifyOptions)

  // await fs.promises.writeFile(`${buildPathTarget}index.html`, minifyFileContent, 'utf8');
  // console.log(`Minify File saved to: ${buildPathTarget}index.html (${await formatBytes(minifyFileContent.length)})`)
}

function injectCustomScript() {
  setTimeout(window.boot, 1);

  window.CustomCreateScript = function () {
    var scriptElement = document.createElement("script");
    scriptElement.removeEventListener = function () {};
    scriptElement.addEventListener = function (eventName, cb) {
      this.src = "";
      if (eventName === "load")
        setTimeout(() => {
          cb && cb();
        }, 10);
    };
    return scriptElement;
  };

  var xmlHttp = (window.CustomXMLHttpRequest = function () {});
  xmlHttp.prototype.send = function () {};
  xmlHttp.prototype.open = function (method, url) {
    const self = this;
    this.status = 200;
    this.url = url;
    this.isloaded = true;

    const jsonExtension = url.match(/\.(json)(\?[a-z0-9=&.]+)?$/);
    const imageExtension = url.match(
      /\.(jpe?g|png|svg|bmp|gif)(\?[a-z0-9=&.]+)?$/
    );
    const audioExtension = url.match(/\.(wav|mp3|ogg)(\?[a-z0-9=&.]+)?$/);

    if (jsonExtension) {
      this.response = atob(window.bundleAsset[url]);
    } else if (imageExtension) {
      this.isloaded = false;
      fetch(window.bundleAsset[url])
        .then((res) => res.blob())
        .then((res) => {
          self.response = res;
          self.onload && self.onload();
        });
    } else if (audioExtension) {
      this.response = Uint8Array.from(atob(window.bundleAsset[url]), (c) =>
        c.charCodeAt(0)
      ).buffer;
    }
  };
  xmlHttp.prototype.setRequestHeader = function () {};
  xmlHttp.prototype.send = function () {
    this.isloaded && this.onload && this.onload();
  };
}
async function addScriptToHTML(htmlFileContent, scriptPath, htmlTag = "head") {
  const scriptContent = await fs.promises.readFile(scriptPath, "utf8");
  return addScriptContentToHTML(htmlFileContent, scriptContent, htmlTag);
}
async function addScriptContentToHTML(
  htmlFileContent,
  scriptContent,
  htmlTag = "head",
  scriptTag = "script"
) {
  // console.log(`Add ${scriptTag} to HTML <${htmlTag}>: ` + (scriptContent.substr(0, 50)))
  const lastIndex = htmlFileContent.lastIndexOf(`</${htmlTag}>`);
  return `${htmlFileContent.substr(
    0,
    lastIndex
  )}<${scriptTag}>${scriptContent}</${scriptTag}>${htmlFileContent.substr(
    lastIndex
  )}`;
}
async function addScriptSourceToHTML(
  htmlFileContent,
  scriptSrc,
  htmlTag = "head",
  scriptTag = "script"
) {
  // console.log(`Add ${scriptTag} to HTML <${htmlTag}>: ` + scriptSrc)
  const lastIndex = htmlFileContent.lastIndexOf(`</${htmlTag}>`);
  return `${htmlFileContent.substr(
    0,
    lastIndex
  )}<${scriptTag} type="text/javascript" src="${scriptSrc}"></${scriptTag}>${htmlFileContent.substr(
    lastIndex
  )}`;
}
