/*global describe, it, expect */
var TileType = require('../../../src/js/helpers/TileTypes')

describe('TileTypes', function () {
  it('should define an empty character', function () {
    expect(TileType.empty).toBeDefined()
  })

  it('should define a floor character', function () {
    expect(TileType.floor).toBeDefined()
  })

  it('should define a wall character', function () {
    expect(TileType.wall).toBeDefined()
  })

  it('should define a set of valid types', function () {
    expect(TileType.validTypes instanceof Array).toBe(true)
  })

  it('should define a set of blocking types', function () {
    expect(TileType.blockingTypes instanceof Array).toBe(true)
  })
})
