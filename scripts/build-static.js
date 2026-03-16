const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const FILES_TO_COPY = [
  "index.html",
  "app.js",
  "styles.css",
  "tailwind.generated.css",
  "favicon.svg",
  "site-config.js",
];

const DIRECTORIES_TO_COPY = ["fixtures"];

function removeDirectory(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function ensureDirectory(target) {
  fs.mkdirSync(target, { recursive: true });
}

function copyFile(relativePath) {
  const source = path.join(ROOT, relativePath);
  const destination = path.join(DIST, relativePath);
  ensureDirectory(path.dirname(destination));
  fs.copyFileSync(source, destination);
}

function copyDirectory(relativePath) {
  const source = path.join(ROOT, relativePath);
  const destination = path.join(DIST, relativePath);
  fs.cpSync(source, destination, { recursive: true });
}

removeDirectory(DIST);
ensureDirectory(DIST);

for (const file of FILES_TO_COPY) {
  copyFile(file);
}

for (const directory of DIRECTORIES_TO_COPY) {
  copyDirectory(directory);
}

console.log("Static site built to dist/");
