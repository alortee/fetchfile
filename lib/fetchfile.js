'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;

function fetchFile(url, options) {
  if (!(this instanceof fetchFile)) {
    return new fetchFile(url, options);
  }

  EventEmitter.call(this);

  if (url && (typeof url === 'object') && (Array.isArray(url))) {
    throw new Error('expects object not array');
  }

  if (options && (typeof options === 'object') && (Array.isArray(options))) {
    throw new Error('expects object not array');
  }

  if (url && (typeof url === 'object')) {
    options = url;
  } else {
    options = options || {};
    if (url) {
      options.url = url;
    }
  }

  this._validOptions = ['url', 'limit', 'mimes', 'filename', 'dirname'];
  this._options = options;

  var self = this;
  ['limit', 'mimes'].forEach(function (prop) {
    self[prop](options[prop]);
  });

  for (var item in options) {
    if (options.hasOwnProperty(item) && (this._validOptions.includes(item))) {
      this[item](options[item]);
    }
  }
}

util.inherits(fetchFile, EventEmitter);

module.exports = fetchFile;

require('./internals')(fetchFile.prototype);
require('./methods')(fetchFile.prototype);
require('./download')(fetchFile.prototype);
