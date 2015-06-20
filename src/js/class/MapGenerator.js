'use strict'

var _ = require('lodash')

var roomSpec = {minRoomSize: 2, maxRoomSize: 10, maxRooms: 10}
var defaults = {mapType: 'dungeon', width: 100, height: 100, roomSpec: roomSpec}
var allowedMapTypes = ['dungeon', 'cave']

/**
 * Class responsible for generating random maps
 *
 * @param {Object} options see defaults
 * @throws {Error} if given an invalid map type
 */
var MapGenerator = function (options) {
  options = _.merge({}, defaults, options)

  if (_.indexOf(allowedMapTypes, options.mapType) === -1) {
    throw new Error(options.mapType + ' is not a valid map type')
  }

  this.mapType = options.mapType
  this.width = options.width
  this.height = options.height
}

MapGenerator.prototype.getMapType = function () {
  return this.mapType
}

/**
 * Main map generator function
 *
 * @return {Array} two dimentional array representing a map
 * @throws {Error} if no generator function exists for the map type
 */
MapGenerator.prototype.generate = function () {
  switch (this.mapType) {
    case 'dungeon':
      // TODO: write dungeon map generation class
      // this.generatedMap = makeInitialMap(this.width, this.height)

      return this.generatedMap
    default:
      throw new Error('Unable to generate a "' + this.mapType + '" map')
  }
}

module.exports = MapGenerator
