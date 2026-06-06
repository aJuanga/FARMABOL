// Configuración de ESLint (formato flat, requerido por ESLint 9).
// Reglas de complejidad y variables sin uso para medir la calidad antes/después del refactor.
module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        module: 'writable',
        require: 'readonly',
        console: 'readonly',
        isNaN: 'readonly',
      },
    },
    rules: {
      complexity: ['warn', 6],
      'max-lines-per-function': ['warn', 40],
      'no-unused-vars': 'warn',
      'prefer-const': 'warn',
      eqeqeq: ['error', 'always'],
    },
  },
  {
    ignores: ['node_modules/', 'data/', 'public/'],
  },
];
