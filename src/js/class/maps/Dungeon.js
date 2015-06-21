'use strict'

var merge = require('lodash/object/merge')
var forEach = require('lodash/collection/forEach')
var random = require('random-number-in-range')
var BaseMap = require('./BaseMap')
var Room = require('../Room')
var TileTypes = require('../../helpers/TileTypes')

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

Dungeon.prototype.generateSingleRoom = function () {
  var options = {
    x: random(1, this.height - (this.maxRoomSize + 1)),
    y: random(1, this.width - (this.maxRoomSize + 1)),
    width: random(this.minRoomSize, this.maxRoomSize),
    height: random(this.minRoomSize, this.maxRoomSize)
  }

  var newRoom = new Room(options)

  // try to stop rooms from intersecting
  forEach(this.rooms, function (room) {
    // don't allow intersecting rooms but bail out after 50 attempts
    for (var i = 0; (newRoom.isIntersecting(room)) && i < 50; i++) {
      options = {
        x: random(1, this.height - (this.maxRoomSize + 1)),
        y: random(1, this.width - (this.maxRoomSize + 1)),
        width: random(this.minRoomSize, this.maxRoomSize),
        height: random(this.minRoomSize, this.maxRoomSize)
      }

      newRoom = new Room(options)
    }
  }, this)

  return newRoom
}

/**
 * Generates rooms and sets them to this.rooms array
 */
Dungeon.prototype.generateRooms = function () {
  var numberOfRooms = random(1, this.maxRooms)

  for (var i = 0; i < numberOfRooms; i++) {
    var newRoom = this.generateSingleRoom()
    this.rooms.push(newRoom)
  }
}

/**
 * Adds a single room to the map
 *
 * @param {Room} room
 */
Dungeon.prototype.addSingleRoomToMap = function (room) {
  for (var y = room.getY(); y < room.getBrY(); y++) {
    // true for the first and last rows
    var isWallRow = room.getY() === y || room.getBrY() - 1 === y

    for (var x = room.getX(); x < room.getBrX(); x++) {
      // true for the first and last columns
      var isWallColumn = room.getX() === x || room.getBrX() - 1 === x

      // if this is the first & last column or row use a wall, otherwise use the floor
      this.generatedMap[x][y] = (isWallRow || isWallColumn) ? TileTypes.wall : TileTypes.floor
    }
  }
}

Dungeon.prototype.generateCorridors = function (currentCenter, previousCenter) {
  // TODO: write this function
}

/**
 * Adds all generated rooms to the map
 */
Dungeon.prototype.addRoomsToMap = function () {
  for (var i = 0; i < this.rooms.length; i++) {
    var currentRoom = this.rooms[i]
    this.addSingleRoomToMap(currentRoom)

    if (i > 0) {
      this.generateCorridors(currentRoom.getCenter(), this.rooms[i - 1].getCenter())
    }
  }
}

/**
 * Main function called by a MapGenerator to generate a Dungeon
 */
Dungeon.prototype.generateMap = function () {
  this.generatedMap = this.generateInitialMap()
  this.generateRooms()
  this.addRoomsToMap()
  return this.generatedMap
}

module.exports = Dungeon
