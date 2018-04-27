'use strict';

const fs = require('fs');

module.exports = function (prototype) {

  prototype.url = function (url) {
    if (typeof url !== 'string') {
      throw new Error('url must be a string');
    }

    var allowedProtocols = ['http:', 'https:'];
    var parsed = require('url').parse(url);


    if (!parsed.protocol) {
      throw new Error('url protocol not specifed');
    }

    if (!allowedProtocols.includes(parsed.protocol)) {
      throw new Error('url protocol not supported');
    }

    this._options.url = parsed;

    return this;
  };

  prototype.limit = function (limit) {
    this._options.limit = this._parseFileSize(limit);

    return this;
  };

  prototype.mimes = function (allowedMimes) {
    var mimes;

    if (typeof allowedMimes === 'string') {
      mimes = [allowedMimes];
    } else if (Array.isArray(allowedMimes)) {
      mimes = allowedMimes;
    } else if (typeof allowedMimes === 'undefined') {
      mimes = ['*'];
    } else {
      throw new Error('invalid param for mimes');
    }

    this._options.mimes = mimes;

    return this;
  };

  prototype.filename  =
  prototype.saveAs    = function (filename) {
    if (typeof filename !== 'string') {
      throw new Error('invalid param for filename');
    }

    this._options.filename = filename;

    return this;
  };

  prototype.dirname = function (path) {
    if (typeof path !== 'string') {
      throw new Error('invalid param for path');
    }

    var self = this;

    try {
      fs.accessSync(path);
      self._options.dirname = path;
      return this;
    } catch (e) {
      throw new Error('directory does not exist');
    }
  };
};
