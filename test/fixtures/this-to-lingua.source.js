/**
 * block comment
 */
var Activity;
var _ = require('underscore');
// comment
var Comment = require('models/comment');
// model
var Model = require('lib/model');
// playlist
var Playlist = require('models/playlist');
// sound
var Sound = require('models/sound');
var URL = require('lib/url');

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
