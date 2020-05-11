<script>
  import { onMount, createEventDispatcher } from "svelte";
  import Toolbar from "./Toolbar.svelte";
  import { pannable } from "./utils/pannable.js";
  import { tapout } from "./utils/tapout.js";
  import { timeout } from "./utils/helper.js";
  export let size;
  export let text;
  export let lineHeight;
  export let x;
  export let y;
  export let fontFamily;
  export let pageScale = 1;
  const dispatch = createEventDispatcher();
  let startX;
  let startY;
  let editable;
  let _size = size;
  let _lineHeight = lineHeight;
  let _fontFamily = fontFamily;
  let dx = 0;
  let dy = 0;
  let operation = "";
  function handlePanMove(event) {
    dx = (event.detail.x - startX) / pageScale;
    dy = (event.detail.y - startY) / pageScale;
  }

  function handlePanEnd(event) {
    if (dx === 0 && dy === 0) {
      return editable.focus();
    }
    dispatch("update", {
      x: x + dx,
      y: y + dy
    });
    dx = 0;
    dy = 0;
    operation = "";
  }
  function handlePanStart(event) {
    startX = event.detail.x;
    startY = event.detail.y;
    operation = "move";
  }
  function onFocus() {
    operation = "edit";
  }
  async function onBlur() {
    if (operation !== "edit" || operation === "tool") return;
    sanitize();
    dispatch("update", {
      lines: extractLines()
    });
    operation = "";
  }
  async function onPaste(e) {
    // get text only
    const pastedText = e.clipboardData.getData("text");
    document.execCommand("insertHTML", false, pastedText);
    // await tick() is not enough
    await timeout();
    sanitize();
  }
  function onKeydown(e) {
    const childNodes = Array.from(editable.childNodes);
    if (e.keyCode === 13) {
      // prevent default adding div behavior
      e.preventDefault();
      const selection = window.getSelection();
      const focusNode = selection.focusNode;
      const focusOffset = selection.focusOffset;
      // the caret is at an empty line
      if (focusNode === editable) {
        editable.insertBefore(
          document.createElement("br"),
          childNodes[focusOffset]
        );
      } else if (focusNode instanceof HTMLBRElement) {
        editable.insertBefore(document.createElement("br"), focusNode);
      }
      // the caret is at a text line but not end
      else if (focusNode.textContent.length !== focusOffset) {
        document.execCommand("insertHTML", false, "<br>");
        // the carat is at the end of a text line
      } else {
        let br = focusNode.nextSibling;
        if (br) {
          editable.insertBefore(document.createElement("br"), br);
        } else {
          br = editable.appendChild(document.createElement("br"));
          br = editable.appendChild(document.createElement("br"));
        }
        // set selection to new line
        selection.collapse(br, 0);
      }
    }
  }
  function onFocusTool() {
    operation = "tool";
  }
  async function onBlurTool() {
    if (operation !== "tool" || operation === "edit") return;
    dispatch("update", {
      lines: extractLines(),
      lineHeight: _lineHeight,
      size: _size
    });
    operation = "";
  }
  function sanitize() {
    let weirdNode;
    while (
      (weirdNode = Array.from(editable.childNodes).find(
        node => !["#text", "BR"].includes(node.nodeName)
      ))
    ) {
      editable.removeChild(weirdNode);
    }
  }
  function render() {
    editable.innerHTML = text;
    editable.focus();
  }
  function extractLines() {
    const nodes = editable.childNodes;
    const lines = [];
    let lineText = "";
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      if (node.nodeName === "BR") {
        lines.push(lineText);
        lineText = "";
      } else {
        lineText += node.textContent;
      }
    }
    lines.push(lineText);
    return lines;
  }
  onMount(render);
</script>

<style>
  .editing {
    @apply pointer-events-none border-gray-800 border-dashed;
  }
</style>

<svelte:options immutable={true} />
{#if operation}
  <Toolbar>
    <div
      use:tapout
      on:tapout={onBlurTool}
      on:mousedown={onFocusTool}
      on:touchstart={onFocusTool}
      class=" h-full flex justify-center items-center bg-gray-200 border-b
      border-gray-300">
      <div class="mr-1 flex items-center">
        <img src="/line_height.svg" class="w-4 mr-1" alt="Line height" />
        <input
          type="number"
          min="1"
          step="0.1"
          class="text-sm w-10 text-center flex-shrink-0"
          bind:value={_lineHeight} />
      </div>
      <div class="flex">
        <img src="/text.svg" class="w-4 mr-1" alt="Font size" />
        <input
          type="number"
          min="12"
          step="1"
          class="text-sm w-10 text-center"
          bind:value={_size} />
      </div>
    </div>
  </Toolbar>
{/if}
<div
  use:tapout
  on:tapout={onBlur}
  class="absolute left-0 top-0 select-none"
  style="transform: translate({x + dx}px, {y + dy}px);">
  <div
    use:pannable
    on:panstart={handlePanStart}
    on:panmove={handlePanMove}
    on:panend={handlePanEnd}
    class="absolute w-full h-full cursor-grab border border-dotted
    border-gray-500"
    class:cursor-grab={!operation}
    class:cursor-grabbing={operation === 'move'}
    class:editing={['edit', 'tool'].includes(operation)} />
  <div
    bind:this={editable}
    on:focus={onFocus}
    on:keydown={onKeydown}
    on:paste|preventDefault={onPaste}
    contenteditable="true"
    spellcheck="false"
    class="outline-none whitespace-no-wrap"
    style="font-size: {_size}px; font-family: '{_fontFamily}'; line-height: {_lineHeight};
    -webkit-user-select: text;" />
</div>
