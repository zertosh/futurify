/**
 * block comment
 */
var Activity;
var _ = require('underscore');
// comment
var Comment = require('models/comment');

/**
 * block comment
 */
Activity = module.exports = Model.extend({

  submodelMap: {},

  translations: function() {
    return this.t('hello', null, {comment: 'world'});
  }
});

// 1
// 2
/**
 * block comment
 */
// 3
