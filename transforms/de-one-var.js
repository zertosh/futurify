'use strict';

var recast = require('../lib/recast');
var utils = require('../lib/utils');

var n = recast.types.namedTypes;
var b = recast.types.builders;

module.exports = function(file, opts) {
  file.visit({
    visitVariableDeclaration: function(path) {
      // skip for-loop inits
      // skip vars with 0 or 1 declarations
      if (n.ForStatement.check(path.parent.node) ||
          path.node.declarations.length <= 1) {
        return this.traverse(path);
      }

      // preserving the first "var" causes weird spacing issues around
      // comments, so just re-build all the declarations.
      var newDecls = path.node.declarations.map(function(decl, i) {
        var newDecl = b.variableDeclaration(path.node.kind, [decl]);
        // re-attach comments
        if (decl.comments) {
          newDecl.comments = decl.comments;
          decl.comments = null;
        }
        // remove the original declaration to get rid of the
        // vertical alignment at the assignment operator
        decl.original = null;
        return newDecl;
      });

      // the comment for the original "var" block needs to be
      // re-attached to the new edge declarations.
      if (path.node.comments) {
        path.node.comments.forEach(function(comment) {
          var idx = comment.trailing ? newDecls.length - 1 : 0;
          if (!newDecls[idx].comments) newDecls[idx].comments = [];
          newDecls[idx].comments.push(comment);
        });
      }

      // recast adds extra line breaks when there is a a comment
      // in between two new statements. they can be compacted by
      // printing each var individually and reparsing. to make this
      // work, we have to manually calculate the new lines that existed
      // before and add those.
      newDecls = newDecls.map(function(newDecl, i) {
        var prepend = '';
        if (i > 0) {
          // calculate how many lines this declaration has
          var aboveEndLine = path.node.declarations[i - 1].loc.end.line;
          var ownStartLine = path.node.declarations[i].loc.start.line;
          if (newDecl.comments) {
            newDecl.comments.forEach(function(comment) {
              if (comment.leading) {
                ownStartLine = Math.min(ownStartLine, comment.loc.start.line);
              }
            });
          }
          var newLinesAbove = ownStartLine - aboveEndLine - 1;
          // prepend new lines that existed before
          if (newLinesAbove) prepend = Array(newLinesAbove + 1).join('\n');
        }
        return prepend + recast.print(newDecl).code;
      }).join('\n');
      newDecls = recast.parse(newDecls).program.body;

      path.replace.apply(path, newDecls);
      utils.fixBodyComments(path.parent);

      // re-traverse the parent since we need to reach into declared
      // function expressions that may have more variable declarations.
      // (e.g. v2's app/views/modals/premium-content.js)
      this.traverse(path.parentPath);
    }
  });
};
