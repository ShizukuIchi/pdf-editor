<script>
  import Tailwind from "./Tailwind.svelte";
  import PDFPage from "./PDFPage.svelte";
  import Image from "./Image.svelte";
  import { getImage } from "./utils/image.js";
  import { readAsArrayBuffer } from "./utils/asyncReader.js";
  let pdfFile;
  let pages = [];
  let allObjects = [];
  let selectedPage = null;
  async function onUploadPDF(e) {
    const file = e.target.files[0];
    if (!file) return;
    selectedPage = null;
    pdfFile = file;
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file));
    const numPages = pdf._pdfInfo.numPages;
    pages = Array(numPages)
      .fill()
      .map((_, i) => pdf.getPage(i + 1));
    allObjects = pages.map(() => []);
    selectedPage = 0;
  }
  async function onUploadImage(e) {
    if (selectedPage === null) return;
    const file = e.target.files[0];
    if (!file) return;
    const currentSelectPage = selectedPage;
    const img = await getImage(file);
    const { width, height } = img;
    const pageObjects = allObjects[selectedPage];
    const object = {
      type: "image",
      width,
      height,
      x: 0,
      y: 0,
      payload: img,
      file,
      page: currentSelectPage
    };
    allObjects[selectedPage] = [...pageObjects, object];
    e.target.value = null;
  }
  function onClick(index) {
    selectedPage = index;
  }
  function move(pageIndex, objectIndex, payload) {
    const { x, y } = payload;
    allObjects[pageIndex][objectIndex].x = x;
    allObjects[pageIndex][objectIndex].y = y;
  }
  async function save() {
    if (!pdfFile) return;
    const pdfDoc = await PDFLib.PDFDocument.load(
      await readAsArrayBuffer(pdfFile)
    );
    const pages = pdfDoc.getPages().map(async (page, pageIndex) => {
      const ps = allObjects[pageIndex].map(async object => {
        const { file, x, y, width, height } = object;
        // maybe there's race condition
        const png = await pdfDoc.embedPng(await readAsArrayBuffer(file));
        page.drawImage(png, {
          x,
          y: page.getHeight() - y - height,
          width,
          height
        });
      });
      return Promise.all(ps);
    });
    await Promise.all(pages);
    const pdfBytes = await pdfDoc.save();
    download(pdfBytes, pdfFile.name, "application/pdf");
  }
</script>

<Tailwind />
<main class="flex justify-center items-stretch p-20 bg-gray-100 min-h-screen">

  <div
    class="fixed z-10 top-0 left-0 right-0 h-12 flex justify-center items-center
    bg-gray-200 border-b border-gray-300">
    <input
      type="file"
      name="pdf"
      id="pdf"
      on:change={onUploadPDF}
      class="hidden" />
    <input
      type="file"
      id="image"
      name="image"
      class="hidden"
      on:change={onUploadImage} />
    <label
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4
      rounded mr-4 cursor-pointer"
      for="pdf">
      Upload PDF
    </label>
    <span class="mr-4">{pdfFile ? pdfFile.name : ''}</span>
    <div class="relative flex h-8 bg-gray-400 mr-4 rounded-sm overflow-hidden">
      <label
        class="flex items-center justify-center h-full w-8 hover:bg-gray-500
        cursor-pointer"
        for="image"
        class:cursor-not-allowed={selectedPage === null}>
        圖
      </label>
      <label
        class="flex items-center justify-center h-full w-8 hover:bg-gray-500
        cursor-pointer"
        for="text"
        class:cursor-not-allowed={selectedPage === null}>
        字
      </label>
      <label
        class="flex items-center justify-center h-full w-8 hover:bg-gray-500
        cursor-pointer"
        for="pen"
        class:cursor-not-allowed={selectedPage === null}>
        筆
      </label>
    </div>
    <button
      on:click={save}
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4
      rounded"
      class:cursor-not-allowed={selectedPage === null}>
      Save
    </button>
  </div>
  {#if pages.length}
    <div>
      {#each pages as page, index (page)}
        <div
          class="relative shadow-lg mb-4 last:mb-0 overflow-hidden"
          class:shadow-outline={index === selectedPage}
          on:click={() => onClick(index)}>
          <PDFPage {page} />
          {#each allObjects[index] as object, oIndex (object)}
            <Image
              on:move={e => move(index, oIndex, e.detail)}
              payload={object.payload}
              x={object.x}
              y={object.y}
              width={object.width}
              height={object.height} />
          {/each}
        </div>
      {/each}
    </div>
  {:else}
    <div class="w-full flex justify-center items-center">
      <span class=" font-bold text-3xl text-gray-500">Drag something here</span>
    </div>
  {/if}
</main>
