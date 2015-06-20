'use strict'

var merge = require('lodash/object/merge')
var random = require('random-number-in-range')
var BaseMap = require('./BaseMap')
var Room = require('../Room')

var defaults = {minRoomSize: 2, maxRoomSize: 10, maxRooms: 10}

/**
 * Dungeon map type - rooms connected via corridors
 *
 * @param {Object} options room options - see defaults
 */
var Dungeon = function (options) {
  options = merge({}, defaults, options)

  // extend the BaseMap class
  BaseMap.apply(this, arguments)

  this.minRoomSize = options.minRoomSize
  this.maxRoomSize = options.maxRoomSize
  this.maxRooms = options.maxRooms
  this.rooms = []
}

Dungeon.prototype = Object.create(BaseMap.prototype)
Dungeon.prototype.constructor = Dungeon

/**
 * Generates rooms and sets them to this.rooms array
 */
Dungeon.prototype.generateRooms = function () {
  var numberOfRooms = random(1, this.maxRooms)

  for (var i = 0; i < numberOfRooms; i++) {
    var options = {
      x: random(1, this.height),
      y: random(1, this.width),
      width: random(this.minRoomSize, this.maxRoomSize),
      height: random(this.minRoomSize, this.maxRoomSize)
    }

    var newRoom = new Room(options)
    this.rooms.push(newRoom)
  }
}

module.exports = Dungeon
