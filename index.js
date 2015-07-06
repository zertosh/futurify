'use strict';

var File = require('./lib/file');

var transforms = {
  'bind-this-to-arrow': require('./transforms/bind-this-to-arrow'),
  'const-require': require('./transforms/const-require'),
  'de-one-var': require('./transforms/de-one-var'),
  'join-var-exports': require('./transforms/join-var-exports'),
  'short-methods': require('./transforms/short-methods'),
  'this-to-lingua': require('./transforms/this-to-lingua'),
  'thisarg-to-arrow': require('./transforms/thisarg-to-arrow'),
};

module.exports = {
  File: File,
  transforms: transforms,

  transform: function(name, source, trs) {
    var file = new File(name, source);
    trs.forEach(function(trPair) {
      var trFunc;
      var trOpts;
      if (typeof trPair[0] === 'string') {
        trFunc = transforms[trPair[0]];
        trOpts = trPair[1] || {};
      } else if (typeof trPair[0] === 'function') {
        trFunc = trPair[0];
        trOpts = trPair[1] || {};
      }
      trFunc(file, trOpts);
      file.reset();
    });
    return {
      code: file.printSource(),
      report: file.report
    };
  }
};
