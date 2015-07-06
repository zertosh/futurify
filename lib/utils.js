'use strict';

var recast = require('./recast');
var sentinel = require('./sentinel');

var NodePath = recast.types.NodePath;
var b = recast.types.builders;

function toNode(thing) {
  return thing instanceof NodePath ? thing.value : thing;
}


/**
 * matching
 */

function matchesPattern(start, pattern, allowPartial) {
  if (!start || start.type !== 'MemberExpression') return false;

  var parts = pattern.split('.');
  var part;
  var nodes = [start];
  var node;
  var i = 0;

  while (nodes.length) {
    node = nodes.shift();
    part = parts[i];
    if (allowPartial && i === parts.length) return true;
    if (node.type === 'Identifier') {
      if (!(part === '*' || part === node.name)) return false;
    } else if (node.type === 'Literal') {
      if (!(part === '*' || part === node.value)) return false;
    } else if (node.type === 'MemberExpression') {
      if (node.computed && !node.property.type === 'Literal') {
        return false;
      } else {
        nodes.push(node.object);
        nodes.push(node.property);
        continue;
      }
    } else if (node.type === 'ThisExpression') {
      if (!(part === '*' || part === 'this')) return false;
    } else {
      return false;
    }
    if (++i > parts.length) return false;
  }

  return true;
}

function isRequireCall(node) {
  node = toNode(node);
  return node
    && node.type === 'CallExpression'
    && node.callee.type === 'Identifier'
    && node.callee.name === 'require';
}

/**
 * comments
 */

function transferComments(source, target) {
  source = toNode(source);
  target = toNode(target);
  target.comments = source.comments;
  source.comments = null;
}


function fixBodyComments(path) {
  var body = path.getValueProperty('body');
  var lastNode = body[body.length - 1];
  if (!lastNode.comments) return;

  var comments = lastNode.comments;
  var placeholder = sentinel.makeStatement();

  placeholder.comments = [];
  lastNode.comments = [];

  comments.forEach(function(comment, idx) {
    if (comment.trailing) {
      placeholder.comments.push(comment);
      comment.trailing = false;
      comment.leading = true;
    } else {
      lastNode.comments.push(comment);
    }
  });

  body.push(placeholder);
}


/**
 * source manipulation
 */

function withSource(ast, callback) {
  var code = recast.print(ast).code;
  var ret = callback(code);
  return typeof ret === 'string' ? fromSource(ret) : ast;
}


function fromSource(source) {
  var ast = recast.parse(source).program.body;
  return ast.length === 1 ? ast[0] : ast;
}


/**
 * arrow functions
 */

function canSafelyBeArrowFunction(funcNode, funcScope) {
  if (!funcNode || funcNode.type !== 'FunctionExpression') {
    return {
      value: false,
      reason: 'bad_node'
    };
  }

  // arrow functions can't be generators
  if (funcNode.generator === true) {
    return {
      value: false,
      reason: 'is_generator'
    };
  }

  // arrow functions are always anonymous.
  // if this is a named function, check that the name
  // isn't used in any child scope
  if (funcNode.id && funcScope.isUsedName(funcNode.id.name)) {
    return {
      value: false,
      reason: 'uses_named_function'
    };
  }

  // arrow functions have lexical arguments.
  // check that only the immediate scope doesn't reference
  // "arguments"
  var usesArguments = funcScope.variables.some(function(variable) {
    return variable.name === 'arguments' && variable.references.length;
  });
  if (usesArguments) {
    return {
      value: false,
      reason: 'uses_arguments'
    };
  }

  return true;
}


function funcToArrowFunc(funcNode) {
  var shortArrowFunction = false;

  // if the function only has a "return", then the
  // return expression can be turned into a simple
  // arrow function
  var arrowFunc;
  if (funcNode.body.body.length === 1
    && funcNode.body.body[0].type === 'ReturnStatement'
    // can't be just a "return;"
    && funcNode.body.body[0].argument
    // these look weird
    && funcNode.body.body[0].argument.type !== 'ConditionalExpression') {
    shortArrowFunction = true;
    arrowFunc = b.arrowFunctionExpression(funcNode.params, funcNode.body.body[0].argument);
  } else {
    arrowFunc = b.arrowFunctionExpression(funcNode.params, funcNode.body);
  }

  // keep the comments for functions that only have a comment argument
  if (!arrowFunc.params.length && arrowFunc.body.comments) {
    var sentinelArg = sentinel.makeIdentifier();
    transferComments(arrowFunc.body, sentinelArg);
    arrowFunc.params.push(sentinelArg);
  }

  // args always have parens (v2 style-guide)
  if (arrowFunc.params.length === 1) {
    arrowFunc = withSource(arrowFunc, function(source) {
      return source.replace(/^(.*)( => )/m, '($1)$2');
    });
    if (arrowFunc.type === 'ExpressionStatement') {
      arrowFunc = arrowFunc.expression;
    }
  }

  // wrap the return in parens (when it looks weird)
  if (shortArrowFunction && (
      arrowFunc.body.type === 'ConditionalExpression' ||
      arrowFunc.body.type === 'LogicalExpression')) {
    arrowFunc = withSource(arrowFunc, function(source) {
      return source.replace(/^(\(.*\) => )(.*)$/, '$1($2)');
    });
  }

  return {
    value: arrowFunc,
    shortArrowFunction: shortArrowFunction
  };
}

///////////////////////////////////////////////////////////////////////////////

module.exports = {
  // matching
  matchesPattern: matchesPattern,
  isRequireCall: isRequireCall,

  // comments
  fixBodyComments: fixBodyComments,
  transferComments: transferComments,

  // source manipulation
  fromSource: fromSource,
  withSource: withSource,

  // arrow functions
  canSafelyBeArrowFunction: canSafelyBeArrowFunction,
  funcToArrowFunc: funcToArrowFunc
};
