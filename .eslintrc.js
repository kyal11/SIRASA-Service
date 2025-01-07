module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    // Aturan yang lebih fleksibel
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }], // Maksimal 2 baris kosong
    'no-trailing-spaces': 'off', // Tidak boleh ada spasi berlebih di akhir baris
    'eol-last': ['error', 'always'], // Selalu tambahkan baris kosong di akhir file

    // Aturan TypeScript
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',

    // Aturan tambahan untuk konsistensi
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Variabel yang tidak digunakan diabaikan jika diawali dengan "_"
    '@typescript-eslint/no-non-null-assertion': 'error', // Tidak boleh ada penggunaan tanda "!"
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
        semi: true,
        singleQuote: true,
        printWidth: 80,
      },
    ],
  },
};
