/*global describe, it, expect */
var Tile = require('../../../src/js/class/Tile')
var TileTypes = require('../../../src/js/helpers/TileTypes')

describe('Tile', function () {
  it('should be instantiable', function () {
    expect(function () {
      new Tile() // eslint-disable-line no-new
    }).not.toThrow()

    expect(new Tile() instanceof Tile).toBe(true)
  })

  it('should throw an error when given an invalid character', function () {
    expect(function () {
      new Tile('nope') // eslint-disable-line no-new
    }).toThrow()
  })

  it('should set a default character when none is given', function () {
    expect(new Tile().getCharacter()).toBe(TileTypes.empty)
  })

  it('should set a character when given', function () {
    expect(new Tile(TileTypes.floor).getCharacter()).toBe(TileTypes.floor)
    expect(new Tile(TileTypes.wall).getCharacter()).toBe(TileTypes.wall)
  })

  it('should not be blocking if it is not a wall', function () {
    expect(new Tile(TileTypes.floor).isBlocking()).toBe(false)
  })

  it('should be blocking if it is a wall', function () {
    expect(new Tile(TileTypes.wall).isBlocking()).toBe(true)
  })
})
