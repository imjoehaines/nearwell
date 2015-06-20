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

  it('should have a default width and height', function () {
    expect(new Dungeon().width).toBe(100)
    expect(new Dungeon().height).toBe(100)
  })

  it('should have set a given width and height', function () {
    expect(new Dungeon({width: 10}).width).toBe(10)
    expect(new Dungeon({height: 20}).height).toBe(20)
  })

  it('should set min and max room size', function () {
    expect(new Dungeon({minRoomSize: 2}).minRoomSize).toBe(2)
    expect(new Dungeon({maxRoomSize: 15}).maxRoomSize).toBe(15)
  })

  it('should set a max number of rooms', function () {
    expect(new Dungeon({maxRooms: 150}).maxRooms).toBe(150)
  })
})
