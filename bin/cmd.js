#!/usr/bin/env node

'use strict';

var _ = require('underscore');
var disparity = require('disparity');
var fs = require('fs');
var globby = require('globby');
var subarg = require('subarg');
var util = require('util');

var futurify = require('../');

var argv = subarg(process.argv.slice(2), {
  default: {
    'diff': false,    // print post-transform diff
    'report': false,  // print transform provided report
    'verbose': false, // print processed file list

    'files': false,   // glob patterns to match
    'write': false,   // save changes to disk
    'transform': []
  }
});

if (!argv.files || !argv.files._) {
  console.error('Usage: futurify --files [ globs... ]');
  process.exit(1);
}

var patterns = [].concat(argv.files._).filter(Boolean).map(function(pattern) {
  return pattern.replace(/\\\//g, '/');
});
var transforms = [].concat(argv.transform).map(function(trArg) {
  if (typeof trArg === 'string') {
    return [trArg, {}];
  } else if (trArg._) {
    return [trArg._[0], _.omit(trArg, '_')];
  }
}).filter(Boolean);

globby(patterns, function(errGlob, files) {
  if (errGlob) throw errGlob;
  var pending = files.length;
  var report = Object.create(null);
  files.forEach(function(file) {
    fs.readFile(file, 'utf-8', function(errRead, source) {
      if (errRead) throw errRead;
      try {
        var ret = futurify.transform(file, source, transforms);
        var changed = source !== ret.code;
        if (argv.report && Object.keys(ret.report).length) {
          report[file] = ret.report;
        }
        if (argv.write && changed) {
          fs.writeFile(file, ret.code);
        }
        if (argv.verbose) {
          process.stdout.write((changed ? '*' : '=') + '\t' + file + '\n');
        }
        if (argv.diff && changed) {
          process.stdout.write(disparity.unified(source, ret.code, {paths: [file]}) + '\n');
        }
      } catch (err) {
        console.error('Error: %s in %j', String(err), file);
        console.error(err.stack);
        process.exit(1);
      }
      if (--pending === 0) {
        if (argv.report) {
          process.stdout.write(util.inspect(report, {depth: null, colors: true}));
        }
      }
    });
  });
});
