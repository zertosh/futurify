/**
 * block comment
 */
var Activity;
var _ = require('underscore');
// comment
var Comment = require('models/comment');
var Lingua = require('lib/lingua');

/**
 * block comment
 */
Activity = module.exports = Model.extend({

  submodelMap: {},

  translations: function() {
    return Lingua.t('hello', null, {comment: 'world'});
  }
});

// 1
// 2
/**
 * block comment
 */
// 3
