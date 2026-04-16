import vuetifyPlugin from 'eslint-plugin-vuetify';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import pluginVue from 'eslint-plugin-vue';

export default defineConfig(
  {
    ignores: [
      '.meteor/**',
      'imports/parser/grammar.js',
      'fileStorage/**',
      '_build/**',
      '.coverage/**',
    ],
  },
  tseslint.configs['recommendedTypeChecked'],
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    rules: {
      quotes: ['error', 'single'],
      'prefer-const': 'error',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/switch-exhaustiveness-check': 'error'
    }
  },
  pluginVue.configs['flat/recommended'],
  vuetifyPlugin.configs['flat/recommended'],
  {
    plugins: {
      'typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
    rules: {
      'vue/block-order': ['error', {
        order: ['script', 'template', 'style']
      }]
    },
  },
);
