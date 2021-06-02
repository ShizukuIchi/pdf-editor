<script>
  import { createEventDispatcher } from "svelte";
  import { pannable } from "./utils/pannable.js";
  import Toolbar from "./Toolbar.svelte";
  import { dict } from "./lang.js";
  import settings from "./settings";
  
  const dispatch = createEventDispatcher();
  let canvas;
  let x = 0;
  let y = 0;
  let path = "";
  let minX = Infinity;
  let maxX = 0;
  let minY = Infinity;
  let maxY = 0;
  let paths = [];
  let drawing = false;

  /* page offset/dimensions */
  var offsetLeft = 0;
  var offsetTop = 0;
  var width = 0;
  var height = 0;

  function handlePanStart(event) {
    offsetLeft = this.offsetParent.offsetLeft;
    offsetTop = this.offsetParent.offsetTop - window.scrollY;
    width = this.offsetParent.offsetWidth;
    height = this.offsetParent.offsetHeight;

    if (event.detail.target !== canvas) {
      return (drawing = false);
    }
    drawing = true;
    x = event.detail.x - offsetLeft;
    y = event.detail.y - offsetTop;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    paths.push(["M", x, y]);
    path += `M${x},${y}`;
  }
  function handlePanMove(event) {
    if (!drawing) return;
    x = event.detail.x - offsetLeft;
    y = event.detail.y - offsetTop;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    paths.push(["L", x, y]);
    path += `L${x},${y}`;
  }
  function handlePanEnd() {
    drawing = false;
  }
  function finish() {
    if (!paths.length) return;
    dispatch("finish", {
      originWidth: width,
      originHeight: height,
      path: paths.reduce((acc, cur) => {
        return acc + cur[0] + cur[1] + "," + cur[2];
      }, ""),
      strokeWidth: settings.strokeWidth
    });
  }
  function cancel() {
    dispatch("cancel");
  }
</script>

<Toolbar>
  <div
    class="h-full flex justify-center items-center bg-gray-300 border-b
      border-gray-400"
  >
    <div class="mr-2 flex items-center">
      <img src="stroke.svg" class="w-6 mr-2" alt="Stroke width" />
      <input
        type="number"
        min={settings.strokeWidthMin}
        max={settings.strokeWidthMax}
        step="1"
        class="h-6 w-12 text-center flex-shrink-0 rounded-sm"
        bind:value={settings.strokeWidth} />
    </div>
    <button
      on:click={cancel}
      class=" bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4
    rounded mr-4"
    >
      {dict.Cancel}
    </button>
    <button
      on:click={finish}
      class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-4
    rounded"
    >
      {dict.Done}
    </button>
  </div>
</Toolbar>
<div
  bind:this={canvas}
  use:pannable
  on:panstart={handlePanStart}
  on:panmove={handlePanMove}
  on:panend={handlePanEnd}
  style="cursor: crosshair; width: 100%; height: 100%"
  class="absolute top-0 left-0 select-none"
  
>
  <svg class="pointer-events-none" width="100%" height="100%">
    <path
      stroke-width={settings.strokeWidth}
      stroke-linejoin="round"
      stroke-linecap="round"
      d={path}
      stroke="black"
      fill="none"
    />
  </svg>
</div>
