<script>
  import { onMount, createEventDispatcher } from "svelte";
  export let page;
  const dispatch = createEventDispatcher();
  let canvas;
  let width;
  let height;
  async function render() {
    const _page = await page;
    const context = canvas.getContext("2d");
    const viewport = _page.getViewport({ scale: 1 });
    width = viewport.width;
    height = viewport.height;
    _page.render({
      canvasContext: context,
      viewport: viewport
    });
    dispatch("measure", {
      width,
      height
    });
  }
  onMount(render);
</script>

<canvas bind:this={canvas} class="w-full" {width} {height} />
