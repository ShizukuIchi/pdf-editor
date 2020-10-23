<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { pannable } from "./utils/pannable.js";
  import { readAsArrayBuffer } from "./utils/asyncReader.js";
  export let originWidth;
  export let originHeight;
  export let width;
  export let x;
  export let y;
  export let pageScale = 1;
  export let path;
  const dispatch = createEventDispatcher();
  let startX;
  let startY;
  let svg;
  let operation = "";
  let dx = 0;
  let dy = 0;
  let dw = 0;
  let direction = "";
  const ratio = originWidth / originHeight;
  async function render() {
    svg.setAttribute("viewBox", `0 0 ${originWidth} ${originHeight}`);
  }
  function handlePanMove(event) {
    const _dx = (event.detail.x - startX) / pageScale;
    const _dy = (event.detail.y - startY) / pageScale;
    if (operation === "move") {
      dx = _dx;
      dy = _dy;
    } else if (operation === "scale") {
      if (direction === "left-top") {
        let d = Infinity;
        d = Math.min(_dx, _dy * ratio);
        dx = d;
        dw = -d;
        dy = d / ratio;
      }
      if (direction === "right-bottom") {
        let d = -Infinity;
        d = Math.max(_dx, _dy * ratio);
        dw = d;
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
        scale: (width + dw) / originWidth
      });
      dx = 0;
      dy = 0;
      dw = 0;
      direction = "";
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
    direction = event.detail.target.dataset.direction;
  }
  function onDelete() {
    dispatch("delete");
  }
  onMount(render);
</script>

<style>
  .operation {
    background-color: rgba(0, 0, 0, 0.1);
  }
</style>

<svelte:options immutable={true} />
<div
  class="absolute left-0 top-0 select-none"
  style="width: {width + dw}px; height: {(width + dw) / ratio}px; transform:
  translate({x + dx}px, {y + dy}px);">
  <div
    use:pannable
    on:panstart={handlePanStart}
    on:panmove={handlePanMove}
    on:panend={handlePanEnd}
    class="absolute w-full h-full cursor-grab border border-gray-400
    border-dashed"
    class:cursor-grabbing={operation === 'move'}
    class:operation>
    <div
      data-direction="left-top"
      class="absolute left-0 top-0 w-10 h-10 bg-green-400 rounded-full
      cursor-nwse-resize transform -translate-x-1/2 -translate-y-1/2 md:scale-25" />
    <div
      data-direction="right-bottom"
      class="absolute right-0 bottom-0 w-10 h-10 bg-green-400 rounded-full
      cursor-nwse-resize transform translate-x-1/2 translate-y-1/2 md:scale-25" />
  </div>
  <div
    on:click={onDelete}
    class="absolute left-0 top-0 right-0 w-12 h-12 m-auto rounded-full bg-white
    cursor-pointer transform -translate-y-1/2 md:scale-25">
    <img class="w-full h-full" src="/delete.svg" alt="delete object" />
  </div>
  <svg bind:this={svg} width="100%" height="100%">
    <path
      stroke-width="5"
      stroke-linejoin="round"
      stroke-linecap="round"
      stroke="black"
      fill="none"
      d={path} />
  </svg>
</div>
