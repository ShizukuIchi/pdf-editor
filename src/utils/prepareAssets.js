const scripts = [
  {
    name: 'pdfjsLib',
    src: 'https://unpkg.com/pdfjs-dist@2.3.200/build/pdf.min.js',
  },
  {
    name: 'PDFLib',
    src: 'https://unpkg.com/pdf-lib@1.4.0/dist/pdf-lib.min.js',
  },
  {
    name: 'download',
    src: 'https://unpkg.com/downloadjs@1.4.7',
  },
  { name: 'makeTextPDF', src: '/makeTextPDF.js' },
];

export default async function prepareAssets() {
  const assets = {};
  window.getAsset = (scriptName) => assets[scriptName];
  // prepare scripts
  scripts.forEach(({ name, src }) => {
    assets[name] = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        resolve(window[name]);
        console.log(`${name} is loaded.`);
      };
      script.onerror = () =>
        reject(`The script ${name} didn't load correctly.`);
      document.body.appendChild(script);
    });
  });
  // prepare font
  // 標楷體 9.9MB
  // assets['defaultFont'] = fetch('/CKs.ttf').then((r) => r.arrayBuffer());
  assets['defaultFont'] = fetch('/NotoSansTC-Regular.woff2').then((r) =>
    r.arrayBuffer()
  );
  const font = new FontFace(
    'default font',
    await window.getAsset('defaultFont')
  );
  font.display = 'swap';
  await font.load();
  document.fonts.add(font);
}
