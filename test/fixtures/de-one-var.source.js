/**
 * block comment
 */
var Activity,
    _        = require('underscore'),
    // comment
    Comment  = require('models/comment'),
    // sound
    Sound    = require('models/sound'),
    Playlist = require('models/playlist'), // playlist
    URL      = require('lib/url'),
    Model    = require('lib/model'); // model

/**
 * block comment
 */
Activity = module.exports = Model.extend({

  submodelMap: {},

  baseUrl: function() {
    var uuid = this.get('uuid'),
        urlOptions = {
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
