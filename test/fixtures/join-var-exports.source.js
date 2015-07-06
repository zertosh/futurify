/**
 * block comment
 */
var Activity;
var _ = require('underscore');
// comment
var Comment = require('models/comment');
// sound
var Sound = require('models/sound');
// playlist
var Playlist = require('models/playlist');
var URL = require('lib/url');
// model
var Model = require('lib/model');

/**
 * block comment
 */
Activity = module.exports = Model.extend({

  submodelMap: {},

  baseUrl: function() {
    var uuid = this.get('uuid');
    var urlOptions = {
      path: ['me/activities/tracks'] // TODO: Will change based on type
    };

    urlOptions.query = {
      cursor: uuid,
      limit: 1
    };

    return URL.stringify(urlOptions);
  }
});

// 1
// 2
/**
 * block comment
 */
// 3
