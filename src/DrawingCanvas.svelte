<script>
  import { createEventDispatcher } from "svelte";
  import { pannable } from "./utils/pannable.js";
  const dispatch = createEventDispatcher();
  let canvas;
  let x = 0;
  let y = 0;
  let path = "";
  function handlePanStart(event) {
    x = event.detail.x;
    y = event.detail.y;
    path += ` M${x},${y}`;
  }
  function handlePanMove(event) {
    x = event.detail.x;
    y = event.detail.y;
    path += ` L${x},${y}`;
  }
  function finish() {
    dispatch("finish", {
      originWidth: canvas.offsetWidth,
      originHeight: canvas.offsetHeight,
      path
    });
  }
</script>

<div
  bind:this={canvas}
  use:pannable
  on:panstart={handlePanStart}
  on:panmove={handlePanMove}
  class="relative w-full h-full">
  <button
    on:click={finish}
    class="absolute right-0 bottom-0 w-24 bg-blue-500 hover:bg-blue-700
    text-white font-bold py-1 px-4 rounded m-4">
    Done
  </button>
  <svg class="w-full h-full">
    <path
      stroke-width="5"
      stroke-linejoin="round"
      stroke-linecap="round"
      d={path}
      stroke="black"
      fill="none" />
  </svg>
</div>
