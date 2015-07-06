'use strict';

var recast = require('../lib/recast');
var utils = require('../lib/utils');
var sentinel = require('../lib/sentinel');

// var n = recast.types.namedTypes;
var b = recast.types.builders;

module.exports = function(file) {
  file.visit({
    visitMemberExpression: function(path) {
      var node = path.node;
      var isT = utils.matchesPattern(node, 'this.t');
      var isTP = utils.matchesPattern(node, 'this.tp');
      if (!(isT || isTP)) return this.traverse(path);

      if (!path.scope.lookup('Lingua')) {
        injectLinguaDeclaration(path);
      }

      path.get('object').replace(b.identifier('Lingua'));

      this.traverse(path);
    }
  });
};

function injectLinguaDeclaration(path) {
  var globalScope = path.scope.getGlobalScope();
  var body = globalScope.path.get('body');
  var atNode;
  var isLast = true;

  Object.keys(globalScope.bindings)
    .filter(function(name) { return /^[A-Za-z]/.test(name); })
    .sort()
    .some(function(binding) {
      var bound = globalScope.bindings[binding][0];
      var init = bound.parent.value.init;
      if (utils.isRequireCall(init)) {
        if (binding > 'Lingua') {
          atNode = parent(bound, 'VariableDeclaration');
          isLast = false;
          return true;
        }
        atNode = parent(bound, 'VariableDeclaration');
      }
    });

  if (!atNode) throw 'no place to put require';
  if (body.value.indexOf(atNode.value) === -1) throw 'require is not toplevel';

  var linguaRequire = makeLinguaDeclaration(atNode.value.kind);

  if (isLast) {
    // use sentinel to swallow empty line
    body.insertAt(atNode.name + 1, sentinel.makeStatement(), linguaRequire);
  } else {
    body.insertAt(atNode.name, linguaRequire);
  }

  utils.fixBodyComments(globalScope.path);

  globalScope.scan(true);
}

function makeLinguaDeclaration(kind) {
  return b.variableDeclaration(kind || 'var', [
    b.variableDeclarator(
      b.identifier('Lingua'),
      b.callExpression(
        b.identifier('require'), [
          b.literal('lib/lingua')
        ]
      )
    )
  ]);
}

function parent(node, type) {
  while (node && node.value.type !== type) {
    node = node.parentPath;
  }
  return node;
}

/*
node ./bin/cmd.js \
  --transform this-to-lingua \
  --files [ '/Users/andres/src/sc/v2/app/**\/*.js' '!**\/{node_modules,public,system,vendor}/**' ] \
  --diff \
  --report \
  --write
*/
