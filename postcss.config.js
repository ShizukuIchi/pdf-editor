const autoprefixer = require('autoprefixer');
const purgecss = require('@fullhuman/postcss-purgecss')({
  content: ['./src/**/*.svelte'],

  whitelistPatterns: [/svelte-/],

  defaultExtractor: (content) => {
    // Recommend: /[\w-/:]+(?<!:)/g
    const standard = content.match(/[\w-/:]+/g) || [];
    const svelteClass = content.match(/(?<=class:)[\w-/:]+/g) || [];
    return standard.concat(svelteClass);
  },
});

const production = !process.env.ROLLUP_WATCH;

module.exports = {
  plugins: [
    require('tailwindcss'),
    autoprefixer,
    ...(production ? [purgecss] : []),
  ],
};
