import App from './App.svelte';

// maybe use this
// var usedLaterScript = document.createElement('script');
//   usedLaterScript.src = 'used-later.js';
//   document.body.appendChild(usedLaterScript);
const loadScripts = {};
window.getScript = async (scriptName) => await loadScripts[scriptName];
Array.from(document.querySelectorAll('[data-async]')).forEach((script) => {
  const scriptName = script.id;
  loadScripts[scriptName] = new Promise((resolve, reject) => {
    // window[scriptName] exist and is not script tag itself
    if (script !== window[scriptName]) {
      resolve(window[scriptName]);
      return console.log(`${scriptName} is loaded.`);
    }
    script.onload = () => {
      resolve(window[scriptName]);
      console.log(`${scriptName} is loaded.`);
    };
    script.onerror = () =>
      reject(`The script ${scriptName} didn't load correctly.`);
  });
});

const app = new App({
  target: document.body,
});

export default app;
