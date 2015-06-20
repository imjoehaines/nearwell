/*global describe, it, expect */
var Dungeon = require('../../../../src/js/class/maps/Dungeon')
var BaseMap = require('../../../../src/js/class/maps/BaseMap')

describe('Dungeon', function () {
  it('should be instantiable', function () {
    expect(function () {
      new Dungeon() // eslint-disable-line no-new
    }).not.toThrow()

    expect(new Dungeon() instanceof Dungeon).toBe(true)
  })

  it('should extend BaseMap', function () {
    expect(new Dungeon() instanceof BaseMap).toBe(true)
  })
})
