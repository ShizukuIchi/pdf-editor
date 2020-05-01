<script>
  // import { onMount } from "svelte";
  import Tailwind from "./Tailwind.svelte";
  import PDFPage from "./PDFPage.svelte";
  import Image from "./Image.svelte";
  import {
    readAsArrayBuffer,
    readAsImage,
    readAsPDF
  } from "./utils/asyncReader.js";
  import { genID } from "./utils/id.js";
  import { save } from "./utils/PDF.js";
  let pdfFile;
  let pages = [];
  let allObjects = [];
  let selectedPageIndex = -1;
  // onMount(async () => {
  //   try {
  //     const res = await fetch("test.pdf");
  //     const blob = await res.blob();
  //     pdfFile = blob;
  //     const pdf = await readAsPDF(blob);
  //     const numPages = pdf.numPages;
  //     pages = Array(numPages)
  //       .fill()
  //       .map((_, i) => pdf.getPage(i + 1));
  //     allObjects = pages.map(() => []);
  //     selectedPageIndex = 0;
  //     const id = genID();
  //     const imgBlob = await (await fetch("test.svg")).blob();
  //     const img = await readAsImage(imgBlob);
  //     const { width, height } = img;
  //     const pageObjects = allObjects[selectedPageIndex];
  //     const object = {
  //       id,
  //       type: "image",
  //       width,
  //       height,
  //       x: 0,
  //       y: 0,
  //       payload: img,
  //       file: imgBlob
  //     };
  //     allObjects = allObjects.map((objects, pIndex) =>
  //       pIndex === selectedPageIndex ? [...objects, object] : objects
  //     );
  //   } catch (e) {
  //     console.log(e);
  //   }
  // });
  async function onUploadPDF(e) {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") return;
    selectedPageIndex = -1;
    pdfFile = file;
    try {
      const pdf = await readAsPDF(file);
      const numPages = pdf.numPages;
      pages = Array(numPages)
        .fill()
        .map((_, i) => pdf.getPage(i + 1));
      allObjects = pages.map(() => []);
      selectedPageIndex = 0;
    } catch (e) {
      console.log(e);
    }
  }
  async function onUploadImage(e) {
    if (selectedPageIndex < 0) return;
    const file = e.target.files[0];
    if (!file) return;
    const id = genID();
    try {
      const img = await readAsImage(file);
      const { width, height } = img;
      const pageObjects = allObjects[selectedPageIndex];
      const object = {
        id,
        type: "image",
        width,
        height,
        x: 0,
        y: 0,
        payload: img,
        file
      };
      allObjects = allObjects.map((objects, pIndex) =>
        pIndex === selectedPageIndex ? [...objects, object] : objects
      );
    } catch (e) {
      console.log(e);
    }
    e.target.value = null;
  }
  function selectPage(index) {
    selectedPageIndex = index;
  }
  function updateObject(objectId, payload) {
    allObjects = allObjects.map((objects, pIndex) =>
      pIndex == selectedPageIndex
        ? objects.map(object =>
            object.id === objectId ? { ...object, ...payload } : object
          )
        : objects
    );
  }
  async function savePDF() {
    if (!pdfFile) return;
    try {
      await save(pdfFile, allObjects);
    } catch (e) {
      console.log(e);
    }
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
        class:cursor-not-allowed={selectedPageIndex < 0}>
        圖
      </label>
      <label
        class="flex items-center justify-center h-full w-8 hover:bg-gray-500
        cursor-pointer"
        for="text"
        class:cursor-not-allowed={selectedPageIndex < 0}>
        字
      </label>
      <label
        class="flex items-center justify-center h-full w-8 hover:bg-gray-500
        cursor-pointer"
        for="pen"
        class:cursor-not-allowed={selectedPageIndex < 0}>
        筆
      </label>
    </div>
    <button
      on:click={savePDF}
      class="mr-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4
      rounded"
      class:cursor-not-allowed={selectedPageIndex < 0}>
      Save
    </button>
  </div>
  {#if pages.length}
    <div>
      {#each pages as page, pIndex (page)}
        <div
          class="relative shadow-lg mb-4 last:mb-0 overflow-hidden"
          class:shadow-outline={pIndex === selectedPageIndex}
          on:click={() => selectPage(pIndex)}>
          <PDFPage {page} />
          {#each allObjects[pIndex] as object (object.id)}
            {#if object.type === 'image'}
              <Image
                on:update={e => updateObject(object.id, e.detail)}
                file={object.file}
                payload={object.payload}
                x={object.x}
                y={object.y}
                width={object.width}
                height={object.height} />
            {/if}
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
