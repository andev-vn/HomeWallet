import fs from 'node:fs';

const dir = 'scripts/designs';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html') && !f.startsWith('body_'));

for (const f of files) {
  const html = fs.readFileSync(`${dir}/${f}`, 'utf8');
  const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = m ? m[1] : html;
  // bỏ bớt thuộc tính data-alt và src ảnh dài cho dễ đọc
  body = body
    .replace(/\sdata-alt="[^"]*"/g, '')
    .replace(/src="https:\/\/lh3[^"]*"/g, 'src="<img>"')
    .replace(/\n\s*\n/g, '\n');
  fs.writeFileSync(`${dir}/body_${f.replace('.html', '.txt')}`, body);
}
console.log('done:', files.length);
