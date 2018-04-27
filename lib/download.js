'use strict';

module.exports = function (prototype) {
  prototype.start     =
  prototype.run       =
  prototype.download  = function () {
    var self = this;

    self._validateOptions();
    self._getTypeAndSize().then(function () {
      self._getFile();
    }).catch(function (err) {
      self.emit('error', err);
    });
  };
};
