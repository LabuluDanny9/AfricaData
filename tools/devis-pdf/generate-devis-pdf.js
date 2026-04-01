/**
 * Génère DEVIS-AfricaData.pdf à partir de DEVIS-AfricaData.md (racine du worktree vvt).
 * Utilise les polices Arial système Windows pour le français.
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const FONT =
  process.env.PDF_FONT_NORMAL ||
  'C:\\Windows\\Fonts\\arial.ttf';
const FONT_BOLD =
  process.env.PDF_FONT_BOLD ||
  'C:\\Windows\\Fonts\\arialbd.ttf';

function stripMd(s) {
  return s
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1');
}

function isTableSeparatorRow(line) {
  const inner = line.replace(/^\|/, '').replace(/\|$/, '');
  if (!inner) return true;
  return /^[\s|\-:]+$/.test(inner);
}

function parseTableRow(line) {
  return line
    .split('|')
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

async function main() {
  const repoRoot = path.join(__dirname, '..', '..');
  const mdPath = path.join(repoRoot, 'DEVIS-AfricaData.md');
  const outPath = path.join(repoRoot, 'DEVIS-AfricaData.pdf');

  if (!fs.existsSync(mdPath)) {
    console.error('Fichier introuvable:', mdPath);
    process.exit(1);
  }
  if (!fs.existsSync(FONT)) {
    console.error('Police introuvable:', FONT);
    process.exit(1);
  }

  const lines = fs.readFileSync(mdPath, 'utf8').split(/\r?\n/);
  const doc = new PDFDocument({ margin: 50, size: 'A4', autoFirstPage: true });
  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  const margin = 50;
  const contentWidth = doc.page.width - 2 * margin;
  let y = margin;

  function ensureSpace(needed) {
    const bottom = doc.page.height - margin;
    if (y + needed > bottom) {
      doc.addPage();
      y = margin;
    }
  }

  function hr() {
    ensureSpace(16);
    doc
      .moveTo(margin, y)
      .lineTo(doc.page.width - margin, y)
      .strokeColor('#888888')
      .lineWidth(0.5)
      .stroke();
    y += 12;
    doc.strokeColor('#000000');
  }

  function writeParagraph(text, opts = {}) {
    const {
      fontSize = 11,
      bold = false,
      indent = 0,
      continuedBullet = false,
    } = opts;
    const w = contentWidth - indent;
    doc.font(bold ? FONT_BOLD : FONT).fontSize(fontSize);
    const h = doc.heightOfString(text, { width: w });
    ensureSpace(h + 8);
    doc.text(text, margin + indent, y, { width: w, align: 'left' });
    y = doc.y + (continuedBullet ? 2 : 6);
  }

  for (const raw of lines) {
    const line = raw;

    if (line.trim() === '') {
      y += 6;
      continue;
    }

    if (line.trim() === '---') {
      hr();
      continue;
    }

    if (line.startsWith('# ')) {
      ensureSpace(28);
      doc.font(FONT_BOLD).fontSize(16);
      doc.text(stripMd(line.slice(2)), margin, y, { width: contentWidth });
      y = doc.y + 10;
      continue;
    }

    if (line.startsWith('## ')) {
      ensureSpace(24);
      doc.font(FONT_BOLD).fontSize(13);
      doc.text(stripMd(line.slice(3)), margin, y, { width: contentWidth });
      y = doc.y + 8;
      continue;
    }

    if (line.startsWith('### ')) {
      ensureSpace(22);
      doc.font(FONT_BOLD).fontSize(12);
      doc.text(stripMd(line.slice(4)), margin, y, { width: contentWidth });
      y = doc.y + 6;
      continue;
    }

    if (line.startsWith('|')) {
      if (isTableSeparatorRow(line)) continue;
      const cells = parseTableRow(line);
      if (cells.length === 0) continue;

      if (cells.length === 2) {
        const left = stripMd(cells[0]);
        const right = stripMd(cells[1]);
        const block = `${left} : ${right}`;
        writeParagraph(block, { fontSize: 10, bold: false });
        continue;
      }

      const row = cells.map((c) => stripMd(c)).join('  |  ');
      writeParagraph(row, { fontSize: 9 });
      continue;
    }

    if (line.startsWith('- ')) {
      writeParagraph(`• ${stripMd(line.slice(2))}`, { indent: 8 });
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      writeParagraph(stripMd(line), { indent: 5 });
      continue;
    }

    if (/^\*[^*].*\*$/.test(line) && !line.includes('**')) {
      const inner = line.replace(/^\*/, '').replace(/\*$/, '');
      writeParagraph(stripMd(inner), { fontSize: 10 });
      continue;
    }

    writeParagraph(stripMd(line));
  }

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
  console.log('PDF écrit:', outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
