'use strict';

var utils = require('../lib/utils');

module.exports = function(file) {
  file.visit({
    visitCallExpression: function(path) {
      if (!isThisBoundCallback(path.value)) {
        return this.traverse(path);
      }

      var func = path.value.callee.object;
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

      path.replace(arrowFunc);
      file.scopeChanged();

      this.traverse(path);
    }
  });
};

function isThisBoundCallback(node) {
  // function(){}.bind(this)
  return (
    node.type === 'CallExpression'
    && node.arguments.length === 1
    && node.arguments[0].type === 'ThisExpression'
    && node.callee.type === 'MemberExpression'
    && node.callee.computed === false
    && node.callee.property.type === 'Identifier'
    && node.callee.property.name === 'bind'
    && node.callee.object.type === 'FunctionExpression'
  );
}

/*
node ./bin/cmd.js \
  --transform bind-this-to-arrow \
  --files [ '/Users/andres/src/sc/v2/app/**\/*.js' '!**\/{node_modules,public,system,vendor}/**' ] \
  --diff \
  --report \
  --write
*/
