'use strict';

/**
 * patches ast-types and wraps recast's parse for espree use.
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

// https://github.com/babel/babel/blob/v5.5.8/src/babel/patch.js

var types = require('recast').types;

var def = types.Type.def;
var or = types.Type.or;

def('Noop');

def('AssignmentPattern')
  .bases('Pattern')
  .build('left', 'right')
  .field('left', def('Pattern'))
  .field('right', def('Expression'));

def('RestElement')
  .bases('Pattern')
  .build('argument')
  .field('argument', def('expression'));

def('DoExpression')
  .bases('Expression')
  .build('body')
  .field('body', [def('Statement')]);

def('Super')
  .bases('Expression');

def('ExportDefaultDeclaration')
  .bases('Declaration')
  .build('declaration')
  .field('declaration', or(
    def('Declaration'),
    def('Expression'),
    null
  ));

def('ExportNamedDeclaration')
  .bases('Declaration')
  .build('declaration')
  .field('declaration', or(
    def('Declaration'),
    def('Expression'),
    null
  ))
  .field('specifiers', [or(
    def('ExportSpecifier')
  )])
  .field('source', or(def('ModuleSpecifier'), null));

def('ExportNamespaceSpecifier')
  .bases('Specifier')
  .field('exported', def('Identifier'));

def('ExportDefaultSpecifier')
  .bases('Specifier')
  .field('exported', def('Identifier'));

def('ExportAllDeclaration')
  .bases('Declaration')
  .build('exported', 'source')
  .field('exported', def('Identifier'))
  .field('source', def('Literal'));

def('BindExpression')
  .bases('Expression')
  .build('object', 'callee')
  .field('object', or(def('Expression'), null))
  .field('callee', def('Expression'));

types.finalize();
