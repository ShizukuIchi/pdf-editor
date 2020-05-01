import { readAsArrayBuffer } from './asyncReader.js';

export async function save(pdfFile, objects) {
  if (!PDFLib) throw new Error('pdf-lib not loaded yet');
  if (!download) throw new Error('downloadjs not loaded yet');
  // PDFLib is imported from cdn
  const pdfDoc = await PDFLib.PDFDocument.load(
    await readAsArrayBuffer(pdfFile)
  );
  const pagesProcesses = pdfDoc.getPages().map(async (page, pageIndex) => {
    const pageObjects = objects[pageIndex];
    const embedProcesses = pageObjects.map(async (object) => {
      const { file, x, y, width, height } = object;
      let img;
      if (file.type === 'image/jpeg') {
        img = await pdfDoc.embedJpg(await readAsArrayBuffer(file));
      } else {
        img = await pdfDoc.embedPng(await readAsArrayBuffer(file));
      }
      // 'y' starts from bottom in PDFLib
      return {
        img,
        x,
        y: page.getHeight() - y - height,
        width: width,
        height,
      };
    });
    return Promise.all(embedProcesses).then((embeddables) => {
      embeddables.forEach(({ img, ...rest }) => {
        page.drawImage(img, rest);
      });
    });
  });
  await Promise.all(pagesProcesses);
  const pdfBytes = await pdfDoc.save();
  // download is imported from cdn
  download(pdfBytes, pdfFile.name, 'application/pdf');
}
