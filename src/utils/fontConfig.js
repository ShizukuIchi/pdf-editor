export default {
  'Noto Sans TC': {
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
