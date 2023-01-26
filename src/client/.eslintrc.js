import { merge } from 'webpack-merge';
import base from '../.eslint.base.js';

module.exports = merge(base, {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['plugin:vue/vue2-essential'],
  plugins: ['vue'],
});
