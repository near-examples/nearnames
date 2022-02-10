// Remember to edit .vscode/settings.json like in https://paulintrognon.fr/blog/typescript-prettier-eslint-next-js

// https://prettier.io/docs/en/options.html
module.exports = {
  trailingComma: 'all',
  endOfLine: 'auto', // https://stackoverflow.com/a/53769213/
  printWidth: 180,
  bracketSpacing: true,
  useTabs: false,
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  arrowParens: 'always',
  overrides: [
    {
      files: 'Routes.js',
      options: {
        printWidth: 200,
      },
    },
  ],
};
