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
  const dispatch = createEventDispatcher();
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
    if (file.type === "image/svg+xml") {
      canvas.toBlob(blob => {
        dispatch("update", {
          file: blob
        });
      });
    }
  }
  function handlePanMove(event) {
    if (operation === "move") {
      dx += event.detail.dx;
      dy += event.detail.dy;
    } else if (operation === "scale") {
      if (directions.includes("left")) {
        dx += event.detail.dx;
        dw -= event.detail.dx;
      }
      if (directions.includes("top")) {
        dy += event.detail.dy;
        dh -= event.detail.dy;
      }
      if (directions.includes("right")) {
        dw += event.detail.dx;
      }
      if (directions.includes("bottom")) {
        dh += event.detail.dy;
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
    if (event.detail.target === event.currentTarget) {
      return (operation = "move");
    }
    operation = "scale";
    directions = event.detail.target.dataset.direction.split("-");
  }
  onMount(render);
</script>

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
    class:cursor-grabbing={operation === 'move'}>
    <div
      data-direction="left"
      class="absolute left-0 top-0 h-full w-1 border-l border-dashed
      border-gray-600 cursor-ew-resize" />
    <div
      data-direction="top"
      class="absolute left-0 top-0 w-full h-1 border-t border-dashed
      border-gray-600 cursor-ns-resize" />
    <div
      data-direction="bottom"
      class="absolute left-0 bottom-0 w-full h-1 border-b border-dashed
      border-gray-600 cursor-ns-resize" />
    <div
      data-direction="right"
      class="absolute right-0 top-0 h-full w-1 border-r border-dashed
      border-gray-600 cursor-ew-resize" />
    <div
      data-direction="left-top"
      style="left: -0.2rem; top: -0.2rem;"
      class="absolute left-0 top-0 w-2 h-2 bg-blue-300 rounded-full
      cursor-nwse-resize" />
    <div
      data-direction="right-top"
      style="right: -0.2rem; top: -0.2rem;"
      class="absolute right-0 top-0 w-2 h-2 bg-blue-300 rounded-full
      cursor-nesw-resize" />
    <div
      data-direction="left-bottom"
      style="left: -0.2rem; bottom: -0.2rem;"
      class="absolute left-0 bottom-0 w-2 h-2 bg-blue-300 rounded-full
      cursor-nesw-resize" />
    <div
      data-direction="right-bottom"
      style="right: -0.2rem; bottom: -0.2rem;"
      class="absolute right-0 bottom-0 w-2 h-2 bg-blue-300 rounded-full
      cursor-nwse-resize" />
  </div>
  <canvas class="w-full h-full" bind:this={canvas} />
</div>
