<script>
  import { onMount, createEventDispatcher } from "svelte";
  export let page;
  const dispatch = createEventDispatcher();
  let canvas;
  let width;
  let height;
  let clientWidth;
  let mounted;
  $: if (mounted) {
    console.log(`Page container size changed: ${clientWidth}`);
    dispatch("measure", {
      scale: canvas.clientWidth / width
    });
  }
  async function render() {
    const _page = await page;
    const context = canvas.getContext("2d");
    const viewport = _page.getViewport({ scale: 1 });
    width = viewport.width;
    height = viewport.height;
    await _page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    mounted = true;
    dispatch("measure", {
      scale: canvas.clientWidth / width
    });
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
