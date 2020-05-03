<script>
  import { onMount } from "svelte";
  import Tailwind from "./Tailwind.svelte";
  import PDFPage from "./PDFPage.svelte";
  import Image from "./Image.svelte";
  import Text from "./Text.svelte";
  import {
    readAsArrayBuffer,
    readAsImage,
    readAsPDF
  } from "./utils/asyncReader.js";
  import { ggID } from "./utils/helper.js";
  import { save } from "./utils/PDF.js";
  const genID = ggID();
  let pdfFile;
  let pdfName = "";
  let pages = [];
  let allObjects = [];
  let selectedPageIndex = -1;

  onMount(async () => {
    try {
      const res = await fetch("/test.pdf");
      const pdfBlob = await res.blob();
      await addPDF(pdfBlob);
      selectedPageIndex = 0;
      // const imgBlob = await (await fetch("/test.svg")).blob();
      // addImage(imgBlob);
      // addTextField("New Text Field!");
    } catch (e) {
      console.log(e);
    }
  });
  async function onUploadPDF(e) {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") return;
    selectedPageIndex = -1;
    try {
      await addPDF(file);
      selectedPageIndex = 0;
    } catch (e) {
      selectedPageIndex = -1;
    }
  }
  async function addPDF(file) {
    try {
      const pdf = await readAsPDF(file);
      pdfName = file.name;
      pdfFile = file;
      const numPages = pdf.numPages;
      pages = Array(numPages)
        .fill()
        .map((_, i) => pdf.getPage(i + 1));
      allObjects = pages.map(() => []);
    } catch (e) {
      console.log("Failed to add pdf.", e);
      throw e;
    }
  }
  async function onUploadImage(e) {
    const file = e.target.files[0];
    if (file && selectedPageIndex >= 0) {
      addImage(file);
    }
    e.target.value = null;
  }
  async function addImage(file) {
    try {
      const img = await readAsImage(file);
      const id = genID();
      const { width, height } = img;
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
      console.log(`Fail to add image.`, e);
    }
  }
  async function onAddTextField() {
    if (selectedPageIndex >= 0) {
      addTextField();
    }
  }
  function addTextField(text = "New Text Field") {
    const id = genID();
    const object = {
      id,
      text,
      type: "text",
      size: 30,
      lineHeight: 1.4,
      x: 0,
      y: 0
    };
    allObjects = allObjects.map((objects, pIndex) =>
      pIndex === selectedPageIndex ? [...objects, object] : objects
    );
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
      await save(pdfFile, allObjects, pdfName);
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
    <span contenteditable="true" bind:innerHTML={pdfName} class="mr-4" />
    <div class="relative flex h-8 bg-gray-400 mr-4 rounded-sm overflow-hidden">
      <label
        class="flex items-center justify-center h-full w-8 hover:bg-gray-500
        cursor-pointer"
        for="image"
        class:cursor-not-allowed={selectedPageIndex < 0}>
        <img src="image.svg" alt="An icon for adding images" />
      </label>
      <label
        class="flex items-center justify-center h-full w-8 hover:bg-gray-500
        cursor-pointer"
        for="text"
        class:cursor-not-allowed={selectedPageIndex < 0}
        on:click={onAddTextField}>
        <img src="text.svg" alt="An icon for adding text" />
      </label>
      <label
        class="flex items-center justify-center h-full w-8 hover:bg-gray-500
        cursor-pointer"
        for="pen"
        class:cursor-not-allowed={selectedPageIndex < 0}>
        <img src="gesture.svg" alt="An icon for adding drawing" />
      </label>
      <label
        class="flex items-center justify-center h-full w-8 hover:bg-gray-500
        cursor-pointer"
        for="pen"
        class:cursor-not-allowed={selectedPageIndex < 0}>
        <img src="add.svg" alt="An icon for create material" />
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
    <div class="w-full">
      {#each pages as page, pIndex (page)}
        <!-- style="border: 1px solid rgba(0,0,0,{pIndex === selectedPageIndex ? 0.1 : 0});" -->

        <div
          class="p-5 w-full flex flex-col items-center overflow-y-hidden"
          on:mousedown={() => selectPage(pIndex)}>
          <div
            class="relative shadow-lg"
            class:shadow-outline={pIndex === selectedPageIndex}>
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
              {:else if object.type === 'text'}
                <Text
                  on:update={e => updateObject(object.id, e.detail)}
                  text={object.text}
                  x={object.x}
                  y={object.y}
                  size={object.size}
                  lineHeight={object.lineHeight} />
              {/if}
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="w-full flex justify-center items-center">
      <span class=" font-bold text-3xl text-gray-500">Drag something here</span>
    </div>
  {/if}
</main>
