var _ = require('lodash')

var defaults = {x: 0, y: 0}

var Room = function (options) {
  // merge defaults with options, using a new object so options isnt required
  options = _.merge({}, defaults, options)

  this.x = options.x
  this.y = options.y
}

Room.prototype.getX = function () {
  return this.x
}

Room.prototype.getY = function () {
  return this.y
}

module.exports = Room
