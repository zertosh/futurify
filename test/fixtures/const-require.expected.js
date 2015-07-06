/**
 * block comment
 */
var initialize;
const _ = require('underscore');
// comment
const Comment = require('models/comment');
// sound
const Sound = require('models/sound');
// playlist
let Playlist = require('models/playlist');
var URL = require('lib/url');
// model
const Model = require('lib/model');

/**
 * block comment
 */
var Activity = module.exports = Model.extend({

  submodelMap: {},

  baseUrl: function() {
    URL = 'cats';
    const View = require('lib/view');
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
