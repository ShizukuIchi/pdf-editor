export async function readAsArrayBuffer(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      res(reader.result);
    };
  });
}
