'use strict';

var sentinel = require('../lib/sentinel');
var utils = require('../lib/utils');

module.exports = function(file) {
  file.visit({
    visitFunctionExpression: function(path) {
      var pnode = path.parentPath.value;
      if (pnode.type !== 'Property'
      || pnode.computed === true
      || pnode.method === true
      || pnode.key.type !== 'Identifier') {
        return this.traverse(path);
      }

      var node = path.value;

      // if the property name !== function name, leave it alone. like:
      // myProp: function myFunc() {}
      if (node.id && node.id.name !== pnode.key.name) {
        if (!file.report.propNotEqualFunc) {
          file.report.propNotEqualFunc = [];
        }
        // TODO: check if name is actually used
        file.report.propNotEqualFunc.push(pnode.key.name + '/' + node.id.name);
        return this.traverse(path);
      }

      // when there are no arguments but there are comments nodes in there
      if (!node.params.length && node.body.comments) {
        var sentinelArg = sentinel.makeIdentifier();
        utils.transferComments(node.body, sentinelArg);
        path.get('params').push(sentinelArg);
      }

      pnode.method = true;

      return this.traverse(path);
    }
  });
};
