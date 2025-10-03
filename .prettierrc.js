// Prettier configuration for Awaken - Elder-friendly coffee ordering app
// Focus on readability and consistency for accessibility development

module.exports = {
  // Basic formatting
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  
  // JSX specific formatting for better accessibility readability
  jsxSingleQuote: true,
  jsxBracketSameLine: false,
  
  // Ensure consistent formatting that aids accessibility
  arrowParens: 'always', // Clearer function syntax
  bracketSpacing: true,   // Easier to read object literals
  endOfLine: 'lf',       // Consistent line endings
  quoteProps: 'as-needed',
  
  // File-specific overrides
  overrides: [
    {
      files: '*.{ts,tsx}',
      options: {
        parser: 'typescript',
      },
    },
    {
      files: '*.{js,jsx}',
      options: {
        parser: 'babel',
      },
    },
    {
      files: '*.json',
      options: {
        parser: 'json',
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        printWidth: 100,
        proseWrap: 'always',
      },
    },
  ],
};