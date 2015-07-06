'use strict';

var utils = require('../lib/utils');

module.exports = function(file) {
  file.visit({
    visitProgram: function(path) {
      var scopeManager = file.getScopeManager();
      scopeManager.scopes.forEach(function(scope) {
        scope.variables.forEach(function(variable) {
          if (variable.defs.length !== 1) return;

          var firstRef = variable.references[0];
          if (!firstRef || !utils.isRequireCall(firstRef.writeExpr)) return;

          for (var i = 1; i < variable.references.length; i++) {
            var nextRef = variable.references[i];
            if (nextRef.isWrite()) {
              file.report.requireOverwrites = true;
              return;
            }
          }

          var def = variable.defs[0];
          if (def.kind === 'var') {
            def.parent.kind = 'const';
          }
        });
      });

      this.traverse(path);
    }
  });
};

/*
node ./bin/cmd.js \
  --transform const-require \
  --files [ '/Users/andres/src/sc/v2/app/**\/*.js' '!**\/{node_modules,public,system,vendor}/**' ] \
  --diff \
  --report \
  --write
*/
