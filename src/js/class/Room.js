var _ = require('lodash')

var defaults = {x: 0, y: 0, width: 1, height: 1}

var Room = function (options) {
  // merge defaults with options, using a new object so options isn't required
  options = _.merge({}, defaults, options)

  this.x = options.x
  this.y = options.y

  this.width = options.width
  this.height = options.height

  // bottom right x & y coordinates
  this.brX = this.x + this.width
  this.brY = this.y + this.height
}

Room.prototype.getX = function () {
  return this.x
}

Room.prototype.getY = function () {
  return this.y
}

Room.prototype.getWidth = function () {
  return this.width
}

Room.prototype.getHeight = function () {
  return this.height
}

Room.prototype.getCenter = function () {
  // don't calculate the center unless we need to
  if (!this.center) {
    this.center = [
      Math.floor((this.y + this.brY) / 2),
      Math.floor((this.x + this.brX) / 2)
    ]
  }

  return this.center
}

module.exports = Room
