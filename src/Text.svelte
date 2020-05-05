<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { pannable } from "./utils/pannable.js";
  import { timeout } from "./utils/helper.js";
  export let size;
  export let text;
  export let lineHeight;
  export let x;
  export let y;
  export let fontFamily;
  const dispatch = createEventDispatcher();
  let editable;
  let _size = size;
  let _lineHeight = lineHeight;
  let _fontFamily = fontFamily;
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
  async function onBlur() {
    sanitize();
    dispatch("update", {
      lines: extractLines()
    });
    // Give toolbar a chance to focus
    operation = "edited";
    await timeout();
    if (operation === "edited") {
      operation = "";
    }
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
    operation = "edit";
  }
  async function onBlurTool() {
    dispatch("update", {
      lines: extractLines(),
      lineHeight: _lineHeight,
      size: _size
    });
    operation = "edited";
    // Give text field a chance to focus
    await timeout();
    if (operation === "edited") {
      operation = "";
    }
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
  // image version text generator
  // function drawText() {
  //   const height = editable.offsetHeight;
  //   const width = editable.offsetWidth;
  //   const fontHeight = _size * _lineHeight;
  //   // prevent crop of last line
  //   canvas.height = height + 10;
  //   canvas.width = width;
  //   const ctx = canvas.getContext("2d");
  //   ctx.font = `${_size}px "${_fontFamily}"`;
  //   const nodes = editable.childNodes;
  //   // FIXME: This fix should rely on ascender and descender of the font instead.
  //   let dy = fontHeight - (fontHeight - _size) / 2 - _size / 5;
  //   let lineText = "";
  //   for (let index = 0; index < nodes.length; index++) {
  //     const node = nodes[index];
  //     if (node.nodeName === "BR") {
  //       ctx.fillText(lineText, 0, dy);
  //       dy += fontHeight;
  //       lineText = "";
  //     } else {
  //       // use textContext to trim strings like &npsp;
  //       lineText += node.textContent;
  //     }
  //   }
  //   if (lineText) {
  //     ctx.fillText(lineText, 0, dy);
  //   }
  // }
  onMount(render);
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
    class="absolute w-full h-full cursor-grab border {operation === 'edit' ? 'border-dotted' : 'border-dashed'}
    border-gray-600"
    class:cursor-grab={!operation}
    class:cursor-grabbing={operation === 'move'}
    class:pointer-events-none={['edit', 'edited'].includes(operation)} />
  <!-- 4.25rem: When text is short and container is short, this element shrink. The number adjustment elements don't take space in no reason. -->
  <div
    class="absolute top-0 p-1 transform -translate-x-full bg-gray-400 rounded-sm"
    class:hidden={!['edit', 'edited'].includes(operation)}
    style="left: -10px; min-width: 4.25rem;">
    <div class="mb-1 flex items-center">
      <img src="/line_height.svg" class="w-4 mr-1" alt="Line height" />
      <input
        type="number"
        min="1"
        step="0.1"
        on:focus={onFocusTool}
        on:blur={onBlurTool}
        class="text-sm w-10 text-center flex-shrink-0"
        bind:value={_lineHeight} />
    </div>
    <div class="flex">
      <img src="/text.svg" class="w-4 mr-1" alt="Font size" />
      <input
        type="number"
        min="9"
        on:focus={onFocusTool}
        on:blur={onBlurTool}
        class="text-sm w-10 text-center"
        bind:value={_size} />
    </div>
  </div>
  <div
    bind:this={editable}
    on:focus={onFocus}
    on:blur={onBlur}
    on:keydown={onKeydown}
    on:paste|preventDefault={onPaste}
    contenteditable="true"
    spellcheck="false"
    class="outline-none whitespace-no-wrap"
    style="font-size: {_size}px; font-family: '{_fontFamily}'; line-height: {_lineHeight};
    -webkit-user-select: text;" />
</div>
