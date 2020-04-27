export function getImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) reject('No file!');
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      resolve(img);
    };
    img.src = objectUrl;
  });
}
