const fs = require("fs");
const path = require("path");
const minifier = require("html-minifier");
const shell = require('shelljs');
const rimraf = require('rimraf');

const CWD = process.cwd();
const templatePath = path.resolve(CWD, "public/index.html");
const ssrPath = path.resolve(CWD, "docs/.tmp/ssr.js");
const indexPath = path.resolve(CWD, "docs/index.html");

const template = fs.readFileSync(templatePath, "utf8");
const app = require(ssrPath);

const version = Date.now();
const { html, head } = app.render();

shell.cp('-R', 'public/assets', 'docs');
shell.cp('-R', 'public/build', 'docs');

const result = template
  .replace("<!-- HTML -->", html)
  .replace("<!-- HEAD -->", head)
  .replace(/\.css/g, `.css?version=${version}`)
  .replace(/\.js/g, `.js?version=${version}`);

const minified = minifier.minify(result, {
  minifyCSS: true,
  collapseWhitespace: true
});

fs.writeFileSync(indexPath, minified);
rimraf.sync('docs/.tmp');
process.exit();
