import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // La nueva regla `set-state-in-effect` marca como error patrones
      // legítimos y muy comunes (sincronizar estado con la URL, cargar
      // datos al montar, poblar un formulario desde props). Se desactiva
      // para no forzar refactorizaciones que alterarían el comportamiento.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // `Productos.jsx` es, por diseño, la "fuente única de datos" de la app:
    // exporta constantes y utilidades (PRODUCTOS_DATA, formatearPrecio,
    // renderizarEstrellas, etc.) que se consumen desde múltiples páginas.
    // Mantenerlas aquí es intencional, por lo que se desactiva la regla que
    // exige exportar solo componentes.
    files: ['src/paginas/Productos.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Archivos del backend (Node.js) usan `process`, `console`, etc.
    files: ['server/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
