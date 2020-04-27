<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { pannable } from "./utils/pannable.js";
  export let payload;
  export let width;
  export let height;
  export let x;
  export let y;
  const dispatch = createEventDispatcher();
  let canvas;
  let moving = false;
  let dx = 0;
  let dy = 0;
  function render() {
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(payload, 0, 0);
  }
  function handlePanStart() {
    moving = true;
  }

  function handlePanMove(event) {
    dx += event.detail.dx;
    dy += event.detail.dy;
  }

  function handlePanEnd(event) {
    dispatch("move", {
      x: x + dx,
      y: y + dy
    });
    moving = false;
    dx = 0;
    dy = 0;
  }
  onMount(render);
</script>

<div
  use:pannable
  on:panstart={handlePanStart}
  on:panmove={handlePanMove}
  on:panend={handlePanEnd}
  class="absolute left-0 top-0 select-none"
  style="width: {width}px; height: {height}px; transform: translate({x + dx}px, {y + dy}px);">
  <div
    class="absolute w-full h-full border border-dashed border-black"
    class:border-none={moving}
    class:cursor-move={moving} />
  <canvas class="w-full h-full" bind:this={canvas} />
</div>
