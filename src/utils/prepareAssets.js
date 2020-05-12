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

const assets = {};
window.getAsset = (scriptName) => assets[scriptName];

export default function prepareAssets() {
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
}

// out of the box fonts
const fonts = {
  Courier: {
    correction(size, lineHeight) {
      return (size * lineHeight - size) / 2 + size / 6;
    },
  },
  Helvetica: {
    correction(size, lineHeight) {
      return (size * lineHeight - size) / 2 + size / 10;
    },
  },
  'Times-Roman': {
    correction(size, lineHeight) {
      return (size * lineHeight - size) / 2 + size / 6;
    },
  },
};
// Available fonts
const Fonts = {
  ...fonts,
  'Noto Sans TC': {
    // 1.4 MB
    src: '/NotoSansTC-Regular.woff2',
    correction(size, lineHeight) {
      return (size * lineHeight - size) / 2 - size / 4;
    },
  },
  CK: {
    src: '/CK.ttf', // 9.9 MB
    correction(size, lineHeight) {
      return (size * lineHeight - size) / 2;
    },
  },
};

export function fetchFont(name) {
  if (fonts[name]) return fonts[name];
  const font = Fonts[name];
  if (!font) throw new Error(`Font '${name}' not exists.`);
  fonts[name] = fetch(font.src)
    .then((r) => r.arrayBuffer())
    .then((fontBuffer) => {
      const fontFace = new FontFace(name, fontBuffer);
      fontFace.display = 'swap';
      fontFace.load().then(() => document.fonts.add(fontFace));
      return {
        ...font,
        buffer: fontBuffer,
      };
    });
}
