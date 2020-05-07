<script>
  import { onMount, createEventDispatcher } from "svelte";
  export let page;
  const dispatch = createEventDispatcher();
  let canvas;
  let width;
  let height;
  let clientWidth = width;
  $: if (clientWidth && width) {
    console.log(clientWidth, width);
    dispatch("measure", {
      scale: clientWidth / width
    });
  }
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
    setTimeout(() => {
      console.log(canvas.clientWidth);
    }, 1000);
  }
  onMount(render);
</script>

<div bind:clientWidth>
  <canvas
    bind:this={canvas}
    class="max-w-full"
    style="width: {width}px;"
    {width}
    {height} />
</div>
