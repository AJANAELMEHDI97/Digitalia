const fs = require('fs');
const zlib = require('zlib');

function tryInflate(buf) {
  try {
    return zlib.inflateSync(buf);
  } catch (e) {
    try {
      return zlib.unzipSync(buf);
    } catch (e2) {
      return null;
    }
  }
}

function extractTextFromString(s) {
  const texts = [];
  // extract (literal) strings
  const paren = /\(([^)]{3,2000}?)\)/g;
  let m;
  while ((m = paren.exec(s))) {
    const t = m[1].replace(/\s+/g, ' ').trim();
    if (/[A-Za-z0-9À-ÖØ-öø-ÿ]{2,}/.test(t)) texts.push(t);
  }

  // extract sequences of readable words
  const words = s.match(/[\wÀ-ÖØ-öø-ÿ'’\-]{4,}/g) || [];
  if (words.length > 30) {
    texts.push(words.slice(0, 200).join(' '));
  } else if (words.length > 0) {
    texts.push(words.join(' '));
  }

  return texts;
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node extract_pdf_text.js <pdf-path>');
    process.exit(2);
  }

  const b = fs.readFileSync(file);
  const latin = b.toString('latin1');
  const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
  let match;
  const extracted = [];

  while ((match = streamRegex.exec(latin)) !== null) {
    const chunkLatin1 = match[1];
    const chunkBuf = Buffer.from(chunkLatin1, 'latin1');
    const out = tryInflate(chunkBuf);
    if (out) {
      const s = out.toString('utf8');
      const texts = extractTextFromString(s);
      if (texts.length) {
        extracted.push(...texts);
      }
    } else {
      // try to decode as latin1 text
      const s2 = chunkBuf.toString('latin1');
      const texts2 = extractTextFromString(s2);
      if (texts2.length) extracted.push(...texts2);
    }
  }

  // also scan the whole file for readable blocks
  const wholeUtf8 = (() => {
    try { return b.toString('utf8'); } catch { return b.toString('latin1'); }
  })();

  const wholeTexts = extractTextFromString(wholeUtf8);
  extracted.push(...wholeTexts);

  // dedupe and filter short/garbage
  const uniq = Array.from(new Set(extracted.map(s => s.replace(/\s+/g,' ').trim()))).filter(s => s.length > 8 && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(s));

  if (!uniq.length) {
    console.log('No readable text extracted.');
    process.exit(0);
  }

  // print top blocks
  for (let i = 0; i < Math.min(200, uniq.length); i++) {
    console.log('--- BLOCK ' + (i+1) + ' ---');
    console.log(uniq[i]);
  }
}

main();
