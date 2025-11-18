import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  react: true,
  nextjs: true,
  typescript: {
    tsconfigPath: 'tsconfig.json',
  },
  stylistic: {
    semi: false,
    quotes: 'single',
  },
  lessOpinionated: true,
  ignores: [
    '**.md',
    'next-env.d.ts',
  ],
}, {
  files: ['src/app/**/loading.tsx'],
  rules: {
    'react/no-array-index-key': 'off',
  },
}, {
  files: ['src/app/**/page.tsx'],
  rules: {
    'react-dom/no-dangerously-set-innerhtml': 'off',
  },
}, {
  files: ['src/lib/airtable/airtable.ts'],
  rules: {
    'perfectionist/sort-imports': 'off',
  },
})
