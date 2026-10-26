#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const root = __dirname;
const rootDir = path.join(root, '..');
const templatePath = path.join(rootDir, 'index.template.html');
const dataPath = path.join(rootDir, 'data', 'sites.json');
const outPath = path.join(rootDir, 'index.html');

const json = fs.readFileSync(dataPath, 'utf8');
const template = fs.readFileSync(templatePath, 'utf8');

if (!template.includes('__SITES_JSON__')) {
  throw new Error('Template is missing the __SITES_JSON__ placeholder.');
}
// Safety: the JSON is embedded inside a <script> tag — a closing sequence would break the page.
if (/<\/script/i.test(json)) {
  throw new Error('sites.json contains "</script" which cannot be embedded inline.');
}
const html = template.replace('__SITES_JSON__', json);
fs.writeFileSync(outPath, html);
console.log(`Built ${path.relative(rootDir, outPath)} (${sitesCount(json)} sites) from data/sites.json`);

function sitesCount(s) {
  const d = JSON.parse(s);
  return d.sites.length;
}
