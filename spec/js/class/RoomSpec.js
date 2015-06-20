/*global describe, it, expect */
var Room = require('../../../src/js/class/Room.js')

describe('Room', function () {
  it('should be instantiable', function () {
    expect(function () {
      new Room() // eslint-disable-line no-new
    }).not.toThrow()

    expect(new Room() instanceof Room).toBe(true)
  })

  it('should set default x and y coordinates', function () {
    var room = new Room()

    expect(room.getX()).toBe(0)
    expect(room.getY()).toBe(0)
  })

  it('should set x and y coordinates when given', function () {
    var room = new Room({x: 10, y: 100})

    expect(room.getX()).toBe(10)
    expect(room.getY()).toBe(100)
  })

  it('should set default width and height', function () {
    var room = new Room()

    expect(room.getWidth()).toBe(1)
    expect(room.getHeight()).toBe(1)
  })

  it('should set width and height when given', function () {
    var room = new Room({width: 10, height: 15})

    expect(room.getWidth()).toBe(10)
    expect(room.getHeight()).toBe(15)
  })

  it('should calculate its center correctly', function () {
    var room = new Room({width: 10, height: 10})

    expect(room.getCenter()).toEqual([5, 5])
  })

  it('should not calculate its center until getCenter is called', function () {
    var room = new Room({width: 10, height: 10})

    expect(room.center).toBeUndefined()
    expect(room.getCenter()).toEqual([5, 5])
  })

  describe('isIntersecting', function () {
    it('should return true when intersecting another room', function () {
      var room1 = new Room({width: 10, height: 10})
      var room2 = new Room({width: 10, height: 10})

      expect(room1.isIntersecting(room2)).toBe(true)
    })

    it('should return false when not intersecting another room', function () {
      var room1 = new Room({width: 10, height: 10})
      var room2 = new Room({x: 100, y: 100, width: 10, height: 10})

      expect(room1.isIntersecting(room2)).toBe(false)
    })

    it('should throw an error if passed something other than a room', function () {
      var room = new Room({width: 10, height: 10})

      expect(function () {room.isIntersecting('something')}).toThrow()
      expect(function () {room.isIntersecting(1)}).toThrow()
      expect(function () {room.isIntersecting({'something': 'else'})}).toThrow()
      expect(function () {room.isIntersecting(['some', 'more', 'things'])}).toThrow()
    })
  })
})
