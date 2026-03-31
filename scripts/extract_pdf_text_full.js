const fs = require('fs');
const path = require('path');

async function main() {
  let pdfParse;
  try {
    pdfParse = require('pdf-parse');
    // support ESM default export interop
    if (pdfParse && typeof pdfParse.default === 'function') {
      pdfParse = pdfParse.default;
    }
  } catch (err) {
    console.error('Module "pdf-parse" not found. Please run `npm install --prefix scripts pdf-parse`.');
    process.exit(1);
  }

  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node extract_pdf_text_full.js <pdf-file>');
    process.exit(1);
  }

  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  const data = fs.readFileSync(filePath);
  try {
    // Support both v1 (function) and v2 (class) exports of pdf-parse
    // v2 exports named PDFParse class: { PDFParse }
    // v1 exported a function: pdfParse(buffer)
    const mod = pdfParse;
    if (typeof mod === 'function') {
      const result = await mod(data);
      process.stdout.write(result.text || '');
      return;
    }

    const PDFParseClass = mod.PDFParse || (mod.default && mod.default.PDFParse);
    if (typeof PDFParseClass === 'function') {
      const parser = new PDFParseClass({ data });
      const textResult = await parser.getText();
      process.stdout.write(textResult.text || '');
      return;
    }

    console.error('Unsupported pdf-parse export shape. Keys:', Object.keys(mod || {}));
    process.exit(3);
  } catch (err) {
    console.error('Error parsing PDF:', err && err.message ? err.message : err);
    process.exit(2);
  }
}

main();
