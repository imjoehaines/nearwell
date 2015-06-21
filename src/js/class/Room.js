'use strict'

var merge = require('lodash/object/merge')
var defaults = {x: 0, y: 0, width: 1, height: 1}

/**
 * Room class - represents a single room in a map
 *
 * @param {Object} options object of options - see defaults
 */
var Room = function (options) {
  // merge defaults with options, using a new object so options isn't required
  options = merge({}, defaults, options)

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

Room.prototype.getBrX = function () {
  return this.brX
}

Room.prototype.getBrY = function () {
  return this.brY
}

Room.prototype.getWidth = function () {
  return this.width
}

Room.prototype.getHeight = function () {
  return this.height
}

/**
 * Gets the center of the room for use with making corridors
 *
 * @return {Array} center coordinates of this room - [x, y]
 */
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

/**
 * Calculates whether this room is intersecting another room
 *
 * @param {Room} otherRoom
 * @return {Boolean} true if rooms are intersecting
 * @throws {Error} if otherRoom is not a Room
 */
Room.prototype.isIntersecting = function (otherRoom) {
  if (!(otherRoom instanceof Room)) throw new Error('otherRoom is not a Room')

  return (this.x <= otherRoom.brX && this.brX >= otherRoom.x &&
    this.y <= otherRoom.brY && otherRoom.brY >= otherRoom.y)
}

module.exports = Room
