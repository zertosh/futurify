'use strict';

var recast = require('./recast');

var b = recast.types.builders;

var SENTINEL = '__MeOw_mEoW_MeOw__';
var sentinelRe = RegExp('(\\n\\s*' + SENTINEL + ';$|\\b' + SENTINEL + '\\b)', 'gm');

module.exports = {
  SENTINEL: SENTINEL,

  makeIdentifier: function() {
    return b.identifier(SENTINEL);
  },

  makeStatement: function() {
    return b.expressionStatement(b.identifier(SENTINEL));
  },

  cleanString: function(str) {
    return str.replace(sentinelRe, '');
  },

  hasSentinel: function(str) {
    return str.indexOf(SENTINEL) !== -1;
  }
};
