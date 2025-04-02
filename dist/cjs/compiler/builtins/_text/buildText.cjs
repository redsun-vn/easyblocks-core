/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@easyblocks/utils');
var locales = require('../../../locales.cjs');

function buildText(x, editorContext) {
  const defaultLocale = locales.getDefaultLocale(editorContext.locales);
  return {
    id: "locale." + utils.uniqueId(),
    value: {
      [defaultLocale.code]: x
    }
  };
}

exports.buildText = buildText;
