'use strict'

var _ = require('lodash')
var TileTypes = require('../helpers/TileTypes')

var defaultCharacter = TileTypes.empty

/**
 * Tile class - represents a single tile in a map
 *
 * @param {String} character
 */
var Tile = function (character) {
  if (typeof character === 'undefined') character = defaultCharacter

  if (_.indexOf(TileTypes.validTypes, character) === -1) {
    throw new Error(character + ' is not a valid character')
  }

  this.character = character
}

Tile.prototype.getCharacter = function () {
  return this.character
}

/**
 * Determines if the tile blocks movement
 *
 * @return {Boolean} true if tile blocks movement
 */
Tile.prototype.isBlocking = function () {
  return _.indexOf(TileTypes.blockingTypes, this.getCharacter()) !== -1
}

module.exports = Tile
