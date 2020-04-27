const purgecss = require('@fullhuman/postcss-purgecss')({
  content: ['./src/**/*.svelte'],

  whitelistPatterns: [/svelte-/],

  defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
});

const production = !process.env.ROLLUP_WATCH;

module.exports = {
  plugins: [
    require('tailwindcss'),
    ...(production ? [require('autoprefixer'), purgecss] : []),
  ],
};
