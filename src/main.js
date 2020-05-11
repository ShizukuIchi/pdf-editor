import App from './App.svelte';
import prepareAssets from './utils/prepareAssets.js';

prepareAssets();
const app = new App({
  target: document.body,
});

export default app;
