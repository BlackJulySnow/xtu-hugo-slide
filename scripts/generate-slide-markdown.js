const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '..', 'content');
const outputDir = path.join(__dirname, '..', 'output', 'markdown');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: content };
  const yaml = match[1];
  const body = match[2];
  const data = {};
  for (const line of yaml.split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      data[key] = val;
    }
  }
  return { data, body };
}

function getOrder(content) {
  const { data } = parseFrontmatter(content);
  if (data.order !== undefined) {
    const n = parseInt(data.order, 10);
    if (!isNaN(n)) return n;
  }
  return null;
}

const decks = fs.readdirSync(contentDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

for (const deck of decks) {
  const deckDir = path.join(contentDir, deck);
  const indexPath = path.join(deckDir, '_index.md');
  
  let output = '';
  
  // Cover
  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    const { data, body } = parseFrontmatter(indexContent);
    output += `# ${data.title || deck}\n\n`;
    if (data.presenter) output += `**汇报人**: ${data.presenter}\n\n`;
    if (data.report_date) output += `**汇报日期**: ${data.report_date}\n\n`;
    if (data.summary) output += `**摘要**: ${data.summary}\n\n`;
    if (body.trim()) {
      output += `${body.trim()}\n\n`;
    }
    output += `---\n\n`;
  } else {
    output += `# ${deck}\n\n`;
  }
  
  // Slides
  const files = fs.readdirSync(deckDir, { withFileTypes: true })
    .filter(f => f.isFile() && f.name.endsWith('.md') && f.name !== '_index.md')
    .map(f => {
      const p = path.join(deckDir, f.name);
      const content = fs.readFileSync(p, 'utf-8');
      return { name: f.name, content, order: getOrder(content) };
    })
    .sort((a, b) => {
      if (a.order !== null && b.order !== null) return a.order - b.order;
      if (a.order !== null) return -1;
      if (b.order !== null) return 1;
      return a.name.localeCompare(b.name);
    });
  
  for (const file of files) {
    const { data, body } = parseFrontmatter(file.content);
    const title = data.subsection_title || data.title || file.name;
    output += `## ${title}\n\n`;
    if (data.section_title && data.section_title !== data.subsection_title) {
      output += `**章节**: ${data.section_title}\n\n`;
    }
    if (body.trim()) {
      output += `${body.trim()}\n\n`;
    }
    output += `---\n\n`;
  }
  
  const outPath = path.join(outputDir, `${deck}.md`);
  fs.writeFileSync(outPath, output, 'utf-8');
  console.log(`Generated: ${outPath} (${files.length} slides)`);
}

console.log(`\nDone! Generated ${decks.length} slide markdown files in ${outputDir}`);
