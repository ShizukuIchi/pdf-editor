<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { pannable } from "./utils/pannable.js";
  export let size;
  export let text;
  export let lineHeight;
  export let x;
  export let y;
  const dispatch = createEventDispatcher();
  let editable;
  let _size = size;
  let _lineHeight = lineHeight;
  let innerHTML = text;
  let dx = 0;
  let dy = 0;
  let operation = "";
  function handlePanMove(event) {
    dx += event.detail.dx;
    dy += event.detail.dy;
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
    operation = "move";
  }
  function onFocus() {
    operation = "edit";
  }
  function onBlur() {
    dispatch("update", {
      text: innerHTML
    });
    operation = "";
  }
  function onKeydown(e) {
    const childNodes = Array.from(editable.childNodes);
    if (e.keyCode === 13) {
      // prevent adding div
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
        // the caret is at a text line but not end
      } else if (focusNode.textContent.length !== focusOffset) {
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
  // onMount(render);
</script>

<svelte:options immutable={true} />
<div
  class="absolute left-0 top-0 select-none"
  style="transform: translate({x + dx}px, {y + dy}px);">
  <div
    use:pannable
    on:panstart={handlePanStart}
    on:panmove={handlePanMove}
    on:panend={handlePanEnd}
    class="absolute w-full h-full cursor-grab border border-dashed
    border-gray-600"
    class:cursor-grab={!operation}
    class:cursor-grabbing={operation === 'move'}
    class:pointer-events-none={operation === 'edit'} />
  <div
    bind:this={editable}
    bind:innerHTML
    on:focus={onFocus}
    on:blur={onBlur}
    on:keydown={onKeydown}
    contenteditable="true"
    spellcheck="false"
    class="outline-none"
    style="font-size: {_size}px; line-height: {_lineHeight}; font-family: 'Noto
    Sans TC';" />
</div>
