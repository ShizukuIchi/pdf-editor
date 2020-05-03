import { readAsArrayBuffer } from './asyncReader.js';

const noop = () => {};

async function registerFontkit(pdfDoc) {
  const getFont = fetch('/NotoSansTC-Regular.otf').then((r) => r.arrayBuffer());
  const fontkit = await window.getScript('fontkit');
  pdfDoc.registerFontkit(fontkit);
  return await getFont;
}

export async function save(pdfFile, objects, name) {
  const PDFLib = await window.getScript('PDFLib');
  const download = await window.getScript('download');
  let pdfDoc;
  try {
    pdfDoc = await PDFLib.PDFDocument.load(await readAsArrayBuffer(pdfFile));
  } catch (e) {
    console.log('Failed to load PDF.');
    throw e;
  }
  let fontBytes;
  if (objects.flat().find((obj) => obj.type === 'text')) {
    try {
      fontBytes = await registerFontkit(pdfDoc);
    } catch (e) {
      console.log('Failed to register fontkit.', e);
      fontBytes = PDFLib.StandardFonts.Helvetica;
    }
  }
  const pagesProcesses = pdfDoc.getPages().map(async (page, pageIndex) => {
    const pageObjects = objects[pageIndex];
    // 'y' starts from bottom in PDFLib, use this to calculate y
    const pageHeight = page.getHeight();
    const embedProcesses = pageObjects.map(async (object) => {
      if (object.type === 'image') {
        const { file, x, y, width, height } = object;
        let img;
        try {
          if (file.type === 'image/jpeg') {
            img = await pdfDoc.embedJpg(await readAsArrayBuffer(file));
          } else {
            img = await pdfDoc.embedPng(await readAsArrayBuffer(file));
          }
          return () =>
            page.drawImage(img, {
              x,
              y: pageHeight - y - height,
              width,
              height,
            });
        } catch (e) {
          console.log('Failed to embed image.', e);
          return noop;
        }
      } else if (object.type === 'text') {
        const { text, x, y, size, lineHeight } = object;
        try {
          const font = await pdfDoc.embedFont(fontBytes);
          const fontHeight = size * lineHeight;
          const lines = text.split('<br>');
          return () =>
            lines.forEach((lineText, lineIndex) => {
              if (!lineText) return;
              page.drawText(lineText, {
                x,
                // PDFLib draw text from bottom so add a magic fix
                y: pageHeight - y - fontHeight * (lineIndex + 1) + size / 3,
                size,
                font,
              });
            });
        } catch (e) {
          console.log('Fail to embed text', e);
          return noop;
        }
      }
    });
    // embed objects in order
    const drawProcesses = await Promise.all(embedProcesses);
    drawProcesses.forEach((p) => p());
  });
  await Promise.all(pagesProcesses);
  try {
    const pdfBytes = await pdfDoc.save();
    download(pdfBytes, name, 'application/pdf');
  } catch (e) {
    console.log('Failed to save PDF.');
    throw e;
  }
}
