'use strict';

module.exports = function (prototype) {
  prototype._getTypeAndSize = function () {
    var self = this;

    return new Promise(function (resolve, reject) {
      var url = self._options.url;
      var protocol = url.protocol.split(':').shift();
      var request = require(protocol);
      var options = {
        method: 'HEAD',
        host: url.hostname,
        port: url.port,
        path: url.path
      };
      var req = request.request(options);

      req.end();

      req.on('response', function (res) {
        if (res.statusCode !== 200) {
          reject(new Error('status code not 200'));
        }

        var type = res.headers['content-type'] || '*';
        var size = parseInt(res.headers['content-length']) || 0;
        var typeIsOk = (self._options.mimes.includes(type) || self._options.mimes.includes('*'));
        var sizeIsOk = (size <= self._options.limit);

        if (typeIsOk && sizeIsOk) {
          resolve();
        } else {
          if (!typeIsOk && sizeIsOk) {
            reject(new Error('file mime-type is disallowed'));
          } else if (!sizeIsOk && typeIsOk) {
            reject(new Error('file size exceedes limit'));
          } else if (!typeIsOk && !sizeIsOk) {
            reject(new Error('file size exceedes limit and file mime-type is disallowed'));
          }
        }
      });

      req.on('error', function (err) {
        reject(err);
      });
    });
  };

  prototype._getFile = function () {
    var _options = this._options;
    var protocol = _options.url.protocol.split(':').shift();
    var filedest = require('path').join(_options.dirname, _options.filename);
    var stream = require('fs').createWriteStream(filedest);
    var request = require(protocol);
    var options = {
      method: 'GET',
      host: _options.url.hostname,
      port: _options.url.port,
      path: _options.url.path
    };

    var self = this;
    var req = request.request(options);
    var exceeded = false;

    req.end();

    req.on('response', function (res) {
      var filesize = parseInt(res.headers['content-length']) || 'unknown';
      var downloaded = 0;
      var pp = 0;
      var percent = 0;

      res.pipe(stream);

      res.on('data', (data) => {
        downloaded += data.byteLength;
        pp = (downloaded/filesize) * 100;
        percent = isNaN(pp) ? 'unknown' : pp;
        self.emit('progress', {filesize, downloaded, percent});

        if (downloaded > _options.limit) {
          req.emit('error', new Error('file size exceeded limit'));
          exceeded = true;
        }
      });
    });

    req.on('error', function (err) {
      req.abort();
      self.emit('error', err);
    });

    stream.on('finish', function () {
      if (!exceeded) {
        self.emit('complete', filedest);
      } else {
        require('fs').unlink(filedest, function (err) {
          if (err) self.emit('error', err);
        });
      }
    });
  };

  prototype._validateOptions = function () {
    var missingOptions = [];
    var self = this;

    self._validOptions.forEach(function (item) {
      var exists = self._options.hasOwnProperty(item);

      if (!exists) {
        missingOptions.push(item);
      }
    });

    if (missingOptions.length !== 0) {
      var missing = missingOptions.join(' ');

      throw new Error('options missing: ' + missing);
    }
  };

  prototype._parseFileSize = function (val) {
    if ((typeof val === 'number') || (typeof val === 'undefined')) {
      return isNaN(parseInt(val)) ? Infinity : parseInt(val);
    } else if (typeof val === 'string') {
      var regex = /^\d+[kmg]$/i;
      var valid = regex.test(val);

      if (valid) {
        var value = val.match(/\d+/)[0];
        var unit = val.toLowerCase().match(/[kmg]/)[0];

        switch (unit) {
        case 'k':
          return value * 1024;
        case 'm':
          return value * 1024 * 1024;
        case 'g':
          return value * 1024 * 1024 * 1024;
        }
      } else {
        throw new Error('invalid param for limit');
      }

    } else {
      throw new Error('invalid param for limit');
    }
  };
};
