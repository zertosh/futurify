'use strict';

/**
 * wraps recast's parse for espree use.
 */

var espree = require('espree');
var recast = require('recast');

// var n = recast.types.namedTypes;
// var b = recast.types.builders;

module.exports = {
  parse: function(source, options) {
    if (!options) options = {};
    options.esprima = espree;
    return recast.parse(source, options);
  },
  visit: recast.visit,
  print: function(node, options) {
    if (!options) options = {};
    if (!options.quote) options.quote = 'single';
    options.esprima = espree;
    return recast.print(node, options);
  },
  prettyPrint: recast.prettyPrint,
  types: recast.types,
  run: recast.run
};
