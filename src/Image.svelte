<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { pannable } from "./utils/pannable.js";
  import { readAsArrayBuffer } from "./utils/asyncReader.js";
  export let payload;
  export let file;
  export let width;
  export let height;
  export let x;
  export let y;
  export let pageScale = 1;
  const dispatch = createEventDispatcher();
  let startX;
  let startY;
  let canvas;
  let operation = "";
  let directions = [];
  let dx = 0;
  let dy = 0;
  let dw = 0;
  let dh = 0;
  async function render() {
    // use canvas to prevent img tag's auto resize
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(payload, 0, 0);
    let scale = 1;
    const limit = 500;
    if (width > limit) {
      scale = limit / width;
    }
    if (height > limit) {
      scale = Math.min(scale, limit / height);
    }
    dispatch("update", {
      width: width * scale,
      height: height * scale
    });
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      canvas.toBlob(blob => {
        dispatch("update", {
          file: blob
        });
      });
    }
  }
  function handlePanMove(event) {
    const _dx = (event.detail.x - startX) / pageScale;
    const _dy = (event.detail.y - startY) / pageScale;
    if (operation === "move") {
      dx = _dx;
      dy = _dy;
    } else if (operation === "scale") {
      if (directions.includes("left")) {
        dx = _dx;
        dw = -_dx;
      }
      if (directions.includes("top")) {
        dy = _dy;
        dh = -_dy;
      }
      if (directions.includes("right")) {
        dw = _dx;
      }
      if (directions.includes("bottom")) {
        dh = _dy;
      }
    }
  }

  function handlePanEnd(event) {
    if (operation === "move") {
      dispatch("update", {
        x: x + dx,
        y: y + dy
      });
      dx = 0;
      dy = 0;
    } else if (operation === "scale") {
      dispatch("update", {
        x: x + dx,
        y: y + dy,
        width: width + dw,
        height: height + dh
      });
      dx = 0;
      dy = 0;
      dw = 0;
      dh = 0;
      directions = [];
    }
    operation = "";
  }
  function handlePanStart(event) {
    startX = event.detail.x;
    startY = event.detail.y;
    if (event.detail.target === event.currentTarget) {
      return (operation = "move");
    }
    operation = "scale";
    directions = event.detail.target.dataset.direction.split("-");
  }
  function onDelete() {
    dispatch("delete");
  }
  onMount(render);
</script>

<style>
  .operation {
    background-color: rgba(0, 0, 0, 0.3);
  }
  .resize-border {
    @apply absolute border-dashed border-gray-600;
  }
  .resize-corner {
    @apply absolute w-10 h-10 bg-blue-300 rounded-full;
  }
</style>

<svelte:options immutable={true} />
<div
  class="absolute left-0 top-0 select-none"
  style="width: {width + dw}px; height: {height + dh}px; transform: translate({x + dx}px,
  {y + dy}px);">

  <div
    use:pannable
    on:panstart={handlePanStart}
    on:panmove={handlePanMove}
    on:panend={handlePanEnd}
    class="absolute w-full h-full cursor-grab"
    class:cursor-grabbing={operation === 'move'}
    class:operation>
    <div
      data-direction="left"
      class="resize-border h-full w-1 left-0 top-0 border-l cursor-ew-resize" />
    <div
      data-direction="top"
      class="resize-border w-full h-1 left-0 top-0 border-t cursor-ns-resize" />
    <div
      data-direction="bottom"
      class="resize-border w-full h-1 left-0 bottom-0 border-b cursor-ns-resize" />
    <div
      data-direction="right"
      class="resize-border h-full w-1 right-0 top-0 border-r cursor-ew-resize" />
    <div
      data-direction="left-top"
      class="resize-corner left-0 top-0 cursor-nwse-resize transform
      -translate-x-1/2 -translate-y-1/2 md:scale-25" />
    <div
      data-direction="right-top"
      class="resize-corner right-0 top-0 cursor-nesw-resize transform
      translate-x-1/2 -translate-y-1/2 md:scale-25" />
    <div
      data-direction="left-bottom"
      class="resize-corner left-0 bottom-0 cursor-nesw-resize transform
      -translate-x-1/2 translate-y-1/2 md:scale-25" />
    <div
      data-direction="right-bottom"
      class="resize-corner right-0 bottom-0 cursor-nwse-resize transform
      translate-x-1/2 translate-y-1/2 md:scale-25" />
  </div>
  <div
    on:click={onDelete}
    class="absolute left-0 top-0 right-0 w-12 h-12 m-auto rounded-full bg-white
    cursor-pointer transform -translate-y-1/2 md:scale-25">
    <img class="w-full h-full" src="/delete.svg" alt="delete object" />
  </div>
  <canvas class="w-full h-full" bind:this={canvas} />
</div>
