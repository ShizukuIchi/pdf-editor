<script>
  import { onMount } from "svelte";
  export let page;
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
  }
  onMount(render);
</script>

<canvas
  bind:this={canvas}
  style="width: {width}px; height: {height}px;"
  {width}
  {height} />
