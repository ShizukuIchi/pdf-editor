<script>
  let portal;
  $: portal && document.body.appendChild(portal);
</script>

<div bind:this={portal}>
  <slot />
</div>
