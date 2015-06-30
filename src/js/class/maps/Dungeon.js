'use strict'

var merge = require('lodash/object/merge')
var forEach = require('lodash/collection/forEach')
var random = require('random-number-in-range')
var inherits = require('inherits')

var BaseMap = require('./BaseMap')
var Room = require('../Room')
var Tile = require('../Tile')
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

inherits(Dungeon, BaseMap)

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

  this.startPosition = {
    x: this.rooms[0].getX(),
    y: this.rooms[0].getY()
  }
}

/**
 * Adds a single room to the map
 *
 * @param {Room} room
 */
Dungeon.prototype.addSingleRoomToMap = function (room, drawWalls) {
  drawWalls = drawWalls || false
  for (var y = room.getY(); y < room.getBrY(); y++) {
    // true for the first and last rows
    var isWallRow = room.getY() === y || room.getBrY() - 1 === y

    for (var x = room.getX(); x < room.getBrX(); x++) {
      // true for the first and last columns
      var isWallColumn = room.getX() === x || room.getBrX() - 1 === x

      // if this is the first & last column or row use a wall, otherwise use the floor
      if ((isWallRow || isWallColumn) && drawWalls) {
        this.generatedMap[x][y] = new Tile(TileTypes.wall)
      } else if (!(isWallRow || isWallColumn)) {
        this.generatedMap[x][y] = new Tile(TileTypes.floor)
      }
    }
  }
}

/**
 * Adds a tile to the map if it is empty
 *
 * @param {integer} x
 * @param {integer} y
 * @param {string} tileType
 */
Dungeon.prototype.drawIfEmpty = function (x, y, tileType) {
  if (this.generatedMap[y][x].character === TileTypes.empty) {
    this.generatedMap[y][x] = new Tile(tileType)
  }
}

/**
 * Generates a horizontal corridor
 *
 * @param {integer} x1
 * @param {integer} x2
 * @param {integer} y
 */
Dungeon.prototype.generateHorizontalCorridor = function (x1, x2, y) {
  for (var x = Math.min(x1, x2); x < Math.max(x1, x2) + 1; x++) {
    // generate walls around the corridor
    this.drawIfEmpty(x, y - 1, TileTypes.wall)
    this.drawIfEmpty(x, y + 1, TileTypes.wall)

    this.generatedMap[y][x] = new Tile(TileTypes.floor)
  }
}

/**
 * Generates a vertical corridor
 *
 * @param {integer} y1
 * @param {integer} y2
 * @param {integer} x
 */
Dungeon.prototype.generateVerticalCorridor = function (y1, y2, x) {
  for (var y = Math.min(y1, y2); y < Math.max(y1, y2) + 1; y++) {
    // generate walls around the corridor
    this.drawIfEmpty(x - 1, y, TileTypes.wall)
    this.drawIfEmpty(x + 1, y, TileTypes.wall)

    this.generatedMap[y][x] = new Tile(TileTypes.floor)
  }
}

/**
 * Generates corridors between two rooms
 *
 * @param {array} currentCenter
 * @param {array} previousCenter
 */
Dungeon.prototype.generateCorridors = function (currentCenter, previousCenter) {
  this.generateHorizontalCorridor(previousCenter[1], currentCenter[1], previousCenter[0])
  this.generateVerticalCorridor(previousCenter[0], currentCenter[0], currentCenter[1])
}

/**
 * Adds all generated rooms to the map
 */
Dungeon.prototype.addRoomsToMap = function () {
  var currentRoom

  for (var i = 0; i < this.rooms.length; i++) {
    var drawWalls = true
    currentRoom = this.rooms[i]
    this.addSingleRoomToMap(currentRoom, drawWalls)

    if (i > 0) {
      this.generateCorridors(currentRoom.getCenter(), this.rooms[i - 1].getCenter())
    }
  }

  // loop through rooms again only drawing floor characters; this will 'hollow' out
  // the rooms so if two are intersecting then the extra walls will become floors
  for (i = 0; i < this.rooms.length; i++) {
    currentRoom = this.rooms[i]
    this.addSingleRoomToMap(currentRoom)
  }
}

/**
 * Connects rooms that are next to each other (.##.)
 *
 * @param {integer} x
 * @param {integer} y
 */
Dungeon.prototype.connectTwoAway = function (x, y) {
  // replace .##. with ....
  if (this.generatedMap[y][x].character === TileTypes.floor &&
    this.generatedMap[y][x + 1].character === TileTypes.wall &&
    this.generatedMap[y][x + 2].character === TileTypes.wall &&
    this.generatedMap[y][x + 3].character === TileTypes.floor) {
    this.generatedMap[y][x + 1].character = TileTypes.floor
    this.generatedMap[y][x + 2].character = TileTypes.floor
  }

  // replace .##. vertically with ....
  if (this.generatedMap[y][x].character === TileTypes.floor &&
    this.generatedMap[y + 1][x].character === TileTypes.wall &&
    this.generatedMap[y + 2][x].character === TileTypes.wall &&
    this.generatedMap[y + 3][x].character === TileTypes.floor) {
    this.generatedMap[y + 1][x].character = TileTypes.floor
    this.generatedMap[y + 2][x].character = TileTypes.floor
  }
}

/**
 * Connects rooms that share a wall (.#.)
 *
 * @param {integer} x
 * @param {integer} y
 */
Dungeon.prototype.connectOneAway = function (x, y) {
  // replace .#. with ...
  if (this.generatedMap[y][x].character === TileTypes.floor &&
    this.generatedMap[y][x + 1].character === TileTypes.wall &&
    this.generatedMap[y][x + 2].character === TileTypes.floor) {
    this.generatedMap[y][x + 1].character = TileTypes.floor
  }

  // replace .#. vertically with ...
  if (this.generatedMap[y][x].character === TileTypes.floor &&
    this.generatedMap[y + 1][x].character === TileTypes.wall &&
    this.generatedMap[y + 2][x].character === TileTypes.floor) {
    this.generatedMap[y + 1][x].character = TileTypes.floor
  }
}

/**
 * Joins rooms together when their walls are touching
 */
Dungeon.prototype.connectAdjacentRooms = function () {
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      this.connectTwoAway(x, y)
      this.connectOneAway(x, y)
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
  this.connectAdjacentRooms()

  return this.generatedMap
}

module.exports = Dungeon
