/*global describe, it, expect */
var random = require('random-number-in-range')
var Dungeon = require('../../../../src/js/class/maps/Dungeon')
var BaseMap = require('../../../../src/js/class/maps/BaseMap')
var Room = require('../../../../src/js/class/Room')
var TileTypes = require('../../../../src/js/helpers/TileTypes')

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

  describe('generateMap', function () {
    describe('generateRooms', function () {
      it('should generate a random number of rooms', function () {
        var dungeon = new Dungeon({maxRooms: 5})
        dungeon.generateRooms()

        expect(dungeon.rooms[0] instanceof Room).toBe(true)
        expect(dungeon.rooms.length).toBeLessThan(6)
      })

      it('should set room properties to random values between given options', function () {
        var options = {width: 100, height: 100, minRoomSize: 2, maxRoomSize: 4, maxRooms: 5}
        var dungeon = new Dungeon(options)

        dungeon.generateRooms()

        expect(dungeon.rooms[0].getWidth()).toBeLessThan(options.maxRoomSize + 1)
        expect(dungeon.rooms[0].getWidth()).toBeGreaterThan(options.minRoomSize - 1)
        expect(dungeon.rooms[0].getHeight()).toBeLessThan(options.maxRoomSize + 1)
        expect(dungeon.rooms[0].getHeight()).toBeGreaterThan(options.minRoomSize - 1)
        expect(dungeon.rooms[0].getX()).toBeLessThan(options.width + 1)
        expect(dungeon.rooms[0].getX()).toBeGreaterThan(0)
        expect(dungeon.rooms[0].getY()).toBeLessThan(options.height + 1)
        expect(dungeon.rooms[0].getY()).toBeGreaterThan(0)
      })
    })

    it('should place the rooms in the map', function () {
      var roomSize = random(3, 10)
      var dungeon = new Dungeon({
        width: 50, height: 50, minRoomSize: roomSize, maxRoomSize: roomSize, maxRooms: 15
      })

      dungeon.generateMap()

      var room = dungeon.rooms[0]
      var x = room.getX()
      var y = room.getY()

      expect(dungeon.generatedMap[y][x]).toEqual(TileTypes.wall)
      expect(dungeon.generatedMap[y + 1][x + 1]).toEqual(TileTypes.floor)
    })
  })
})
