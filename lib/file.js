'use strict';

var escope = require('escope');
var recast = require('./recast');
var sentinel = require('./sentinel');

var shebangRe = /^#!.*\n/;

function File(name, source) {
  this.name = name || '_untitled.js';
  this.source = source;
  this.ast = null;
  this.scopeManager = null;
  this.shebang = '';
  this.report = Object.create(null);
}

File.prototype.getAst = function() {
  if (this.ast) return this.ast;
  var self = this;
  var unprefixedSource = this.source.replace(shebangRe, function(match) {
    self.shebang = match;
    return '';
  });
  this.ast = recast.parse(unprefixedSource);
  return this.ast;
};

File.prototype.getScopeManager = function(force) {
  if (!force && this.scopeManager) return this.scopeManager;
  this.scopeManager = escope.analyze(this.getAst(), {
    nodejsScope: true,
    ecmaVersion: 6
  });
  return this.scopeManager;
};

File.prototype.scopeChanged = function() {
  this.scopeManager = null;
};

File.prototype.printSource = function() {
  if (!this.ast) return this.source;
  var code = recast.print(this.ast, {wrapColumn: 120}).code;
  if (this.shebang) {
    code = this.shebang + code;
  }
  if (sentinel.hasSentinel(code)) {
    code = sentinel.cleanString(code);
  }
  return code;
};

File.prototype.editSource = function(callback) {
  var source = this.printSource();
  var newSource = callback(source);
  if (newSource !== source) {
    this.reset(newSource);
  }
  return this;
};

File.prototype.reset = function(source) {
  if (!source) source = this.printSource();
  var report = this.report;
  File.call(this, this.name, source);
  this.report = report;
  return this;
};

File.prototype.visit = function(visitors) {
  recast.visit(this.getAst(), visitors);
  return this;
};

module.exports = File;
