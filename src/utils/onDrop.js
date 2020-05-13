import { onMount, onDestroy } from "svelte";

export default (target, callback = () => {}) => {
  const stopDefault = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const dropHandler = (e) => {
    stopDefault(e);
    callback(e);
  };
  if (!target) return;

  onMount(() => {
    target.addEventListener("dragenter", stopDefault, true);
    target.addEventListener("dragover", stopDefault, true);
    target.addEventListener("dragleave", stopDefault, true);
    target.addEventListener("drop", dropHandler, true);
  });
  onDestroy(() => {
    target.removeEventListener("dragenter", stopDefault, true);
    target.removeEventListener("dragover", stopDefault, true);
    target.removeEventListener("dragleave", stopDefault, true);
    target.removeEventListener("drop", dropHandler, true);
  });
};
