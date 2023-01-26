import { merge } from 'webpack-merge';
import base from '../.eslint.base.js';

module.exports = merge(base, {
  env: {
    es2021: true,
    node: true,
  },
});
