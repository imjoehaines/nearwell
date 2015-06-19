/*global describe, it, expect */
var Tile = require('../../../src/js/class/Tile.js')

describe('Tile', function () {
  it('should be instantiable', function () {
    expect(function () {
      new Tile('.')
    }).not.toThrow()

    expect(new Tile('.') instanceof Tile).toBe(true)
  })

  it('should throw an error when given an invalid character', function () {
    expect(function () {
      new Tile('nope')
    }).toThrow()
  })

  it('should set a default character when none is given', function () {
    expect(new Tile().getCharacter()).toBe(' ')
  })

  it('should set a character when given', function () {
    expect(new Tile('.').getCharacter()).toBe('.')
    expect(new Tile('#').getCharacter()).toBe('#')
  })

  it('should not be blocking if it is not a wall', function () {
    expect(new Tile().isBlocking()).toBe(false)
  })

  it('should be blocking if it is a wall', function () {
    expect(new Tile('#').isBlocking()).toBe(true)
  })
})
