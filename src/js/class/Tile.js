'use strict'

var _ = require('lodash')

var empty = ' '
var wall = '#'
var floor = '.'

var allowedOptions = [empty, wall, floor]
var blockingCharacters = [wall]
var defaultCharacter = empty

/**
 * Tile class - represents a single tile in a map
 *
 * @param {String} character
 */
var Tile = function (character) {
  if (typeof character === 'undefined') character = defaultCharacter

  if (_.indexOf(allowedOptions, character) === -1) {
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
  return _.indexOf(blockingCharacters, this.getCharacter()) !== -1
}

module.exports = Tile
