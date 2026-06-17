import fs from 'node:fs';

const API_KEY = 'AQ.Ab8RN6LhfOHQQnaCiyv1PY8NrmiavjhwOeSTDLLEFxdU5_5O1w';
const r = JSON.parse(fs.readFileSync('scripts/_last.json', 'utf8'));
const screens = JSON.parse(r.content[0].text).screens;

fs.mkdirSync('scripts/designs', { recursive: true });

const slug = (t) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .toLowerCase()
    .replace(/^_|_$/g, '');

for (const x of screens) {
  const ref = x.htmlCode;
  const url = ref?.downloadUrl;
  const name = slug(x.title) + '.html';
  if (!url) {
    console.log(`${name}\tNO URL`);
    continue;
  }
  try {
    const res = await fetch(url, { headers: { 'X-Goog-Api-Key': API_KEY } });
    const html = await res.text();
    fs.writeFileSync(`scripts/designs/${name}`, html);
    console.log(`${name}\t${res.status}\t${html.length}b\t${x.deviceType}`);
  } catch (e) {
    console.log(`${name}\tERR ${e.message}`);
  }
}
