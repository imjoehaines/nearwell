'use strict'

var _ = require('lodash')
var BaseMap = require('./BaseMap')

var defaults = {minRoomSize: 2, maxRoomSize: 10, maxRooms: 10}

var Dungeon = function (options) {
  options = _.merge({}, defaults, options)

  // extend the BaseMap class
  BaseMap.apply(this, arguments)

  this.minRoomSize = options.minRoomSize
  this.maxRoomSize = options.maxRoomSize
  this.maxRooms = options.maxRooms
}

Dungeon.prototype = Object.create(BaseMap.prototype)
Dungeon.prototype.constructor = Dungeon

module.exports = Dungeon
