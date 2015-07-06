'use strict';

var recast = require('../lib/recast');
var utils = require('../lib/utils');

var n = recast.types.namedTypes;
var b = recast.types.builders;

module.exports = function(file, opts) {
  file.visit({
    visitProgram: function(path) {
      var exportsAssignment;
      path.get('body').each(function(p) {
        // test for "a = b = module.exports = c"
        if (!isExportsAssignment(p.value)) return;
        // is it a plain "module.exports = {}"?
        if (isModuleExports(p.value.expression.left)) return;
        if (exportsAssignment) throw 'too many "module.exports"';
        exportsAssignment = p;
      });
      if (!exportsAssignment) return this.traverse(path);

      var exportsIdentifier = exportsAssignment.get('expression', 'left').value;
      n.Identifier.assert(exportsIdentifier);
      var exportsName = exportsIdentifier.name;

      var manager = file.getScopeManager();
      var firstScope = manager.globalScope.childScopes[0]; // nodejs toplevel
      var idRefs = firstScope.references.filter(function(ref) {
        return ref.identifier.name === exportsName && ref.isWrite();
      });
      if (idRefs.length !== 1) throw 'written to multiple times';

      var exportsDecl;
      path.get('body').each(function(p) {
        var node = p.value;
        if (node.type !== 'VariableDeclaration') return;
        var foundDecl = node.declarations.some(function(decl) {
          if (decl.id.type === 'Identifier' &&
              decl.id.name === exportsName) {
            return true;
          }
        });
        if (!foundDecl) return;

        // we'll only do single variable declarations
        if (node.declarations.length !== 1) return;
        // exports var declaration already initialized
        if (node.declarations[0].init) return;
        if (exportsDecl) throw 'exports var has multiple declarations';
        exportsDecl = p;
      });

      var kind = opts.kind || exportsDecl.value.kind;
      var exportsVarDecl = b.variableDeclaration(kind, [
        b.variableDeclarator(
          exportsDecl.value.declarations[0].id,
          exportsAssignment.value.expression.right
        )
      ]);

      utils.transferComments(exportsAssignment, exportsVarDecl);
      exportsAssignment.replace(exportsVarDecl);
      removeAndDistributeComments(exportsDecl);

      utils.fixBodyComments(path);
      file.scopeChanged();

      return false;
    }
  });
};


// takes the surrounding comments and moves them to its siblings
function removeAndDistributeComments(path) {
  var comments = path.value.comments;
  if (!comments || !comments.length) {
    path.replace(null);
    return;
  }
  var body = path.parentPath.value;
  if (!Array.isArray(body) || body.length <= 1) {
    throw 'path has comments but can\'t be distributed';
  }
  path.value.comments = null;
  var before = body[path.name - 1];
  var after = body[path.name + 1];
  if (before) {
    if (!before.comments) before.comments = [];
    comments.forEach(function(comment) {
      if (comment.leading) {
        comment.leading = false;
        comment.trailing = true;
      }
      before.comments.push(comment);
    });
  } else if (after) {
    if (!after.comments) after.comments = [];
    comments.reduceRight(function(_, comment) {
      if (comment.trailing) {
        comment.trailing = false;
        comment.leading = true;
      }
      after.comments.unshift(comment);
    }, 0);
  }
  path.replace(null);
}

function isExportsAssignment(node) {
  if (node.type === 'ExpressionStatement') {
    return isExportsAssignment(node.expression);
  } else if (node.type === 'AssignmentExpression') {
    return isModuleExports(node.left) ? true : isExportsAssignment(node.right);
  } else {
    return false;
  }
}

function isModuleExports(node) {
  return utils.matchesPattern(node, 'module.exports');
}
