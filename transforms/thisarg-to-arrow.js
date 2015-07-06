'use strict';

var utils = require('../lib/utils');

var THISARG_METHODS = {
  // methodName: [ [callbackIndex, thisArgIndex] ]
  'map': [[0, 1], [1, 2]],
  'forEach': [[0, 1], [1, 2]],
  'some': [[0, 1], [1, 2]],
  'filter': [[0, 1], [1, 2]],
  'reduce': [[0, 2], [1, 3]],

  // underscore only
  'mapObject': [[1, 2]],
  'find': [[0, 1], [1, 2]],
  'each': [[0, 1], [1, 2]]

  // no "on" because we might be using the context
  // to unbind backbone events
};
THISARG_METHODS.__proto__ = null;

module.exports = function(file) {
  file.visit({
    visitCallExpression: function(path) {
      var node = path.value;

      if (!(
        node.type === 'CallExpression'
        && node.callee.type === 'MemberExpression'
        && node.callee.computed === false
        && node.callee.property.type === 'Identifier'
        && THISARG_METHODS[node.callee.property.name])) {
        return this.traverse(path);
      }

      var argsPath;
      var funcPath;
      var thisPath;
      THISARG_METHODS[node.callee.property.name].some(function(pair) {
        var funcIdx = pair[0];
        var thisIdx = pair[1];
        var funcArg = node.arguments[funcIdx];
        var thisArg = node.arguments[thisIdx];
        var afterThisArg = node.arguments[thisIdx + 1];
        if (funcArg
          && thisArg
          && funcArg.type === 'FunctionExpression'
          && thisArg.type === 'ThisExpression'
          && !afterThisArg) {
          argsPath = path.get('arguments');
          funcPath = argsPath.get(funcIdx);
          thisPath = argsPath.get(thisIdx);
          return true;
        }
      });

      if (!argsPath) {
        return this.traverse(path);
      }

      var func = funcPath.value;
      var funcScope = file.getScopeManager().acquire(func, true);
      var canBeArrowFunc = utils.canSafelyBeArrowFunction(func, funcScope);

      if (canBeArrowFunc !== true) {
        file.report[canBeArrowFunc.reason] = true;
        return this.traverse(path);
      }

      var converted = utils.funcToArrowFunc(func);
      var arrowFunc = converted.value;
      if (converted.shortArrowFunction) {
        file.report.shortArrowFunction = true;
      }

      funcPath.replace(arrowFunc);
      thisPath.prune();
      file.scopeChanged();

      this.traverse(path);
    }
  });
};

/*
node ./bin/cmd.js \
  --transform thisarg-to-arrow \
  --files [ '/Users/andres/src/sc/v2/app/**\/*.js' '!**\/{node_modules,public,system,vendor}/**' ] \
  --diff \
  --report \
  --write
*/
