'use strict';

var fs = require('fs');
var test = require('tap').test;

var futurify = require('../');

test('bind-this-to-arrow', function(t) {
  t.plan(1);
  var name = 'bind-this-to-arrow';
  var trs = [['bind-this-to-arrow']];
  withFixture(name, trs, function(ret, fix) {
    t.equal(ret.code, fix.expected);
  });
});

test('de-one-var', function(t) {
  t.plan(1);
  var name = 'de-one-var';
  var trs = [['de-one-var']];
  withFixture(name, trs, function(ret, fix) {
    t.equal(ret.code, fix.expected);
  });
});

test('short-methods', function(t) {
  t.plan(1);
  var name = 'short-methods';
  var trs = [['short-methods']];
  withFixture(name, trs, function(ret, fix) {
    t.equal(ret.code, fix.expected);
  });
});

test('join-var-exports', function(t) {
  t.plan(1);
  var name = 'join-var-exports';
  var trs = [['join-var-exports']];
  withFixture(name, trs, function(ret, fix) {
    t.equal(ret.code, fix.expected);
  });
});

test('this-to-lingua', function(t) {
  t.plan(1);
  var name = 'this-to-lingua';
  var trs = [['this-to-lingua']];
  withFixture(name, trs, function(ret, fix) {
    t.equal(ret.code, fix.expected);
  });
});

test('this-to-lingua-2', function(t) {
  t.plan(1);
  var name = 'this-to-lingua-2';
  var trs = [['this-to-lingua']];
  withFixture(name, trs, function(ret, fix) {
    t.equal(ret.code, fix.expected);
  });
});

test('const-require', function(t) {
  t.plan(1);
  var name = 'const-require';
  var trs = [['const-require']];
  withFixture(name, trs, function(ret, fix) {
    t.equal(ret.code, fix.expected);
  });
});


/** helpers **/

function withFixture(name, trs, done) {
  var sourceName = 'test/fixtures/' + name + '.source.js';
  var expectedName = 'test/fixtures/' + name + '.expected.js';
  var source = fs.readFileSync(sourceName, 'utf8');
  var expected = fs.readFileSync(expectedName, 'utf8');
  var out = futurify.transform(sourceName, source, trs);
  var fix = {sourceName: sourceName, expected: expected};
  done(out, fix);
}
