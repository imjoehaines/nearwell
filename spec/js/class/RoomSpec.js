/*global describe, it, expect, jasmine */
var Room = require('../../../src/js/class/Room.js')

describe('Room', function () {
  it('should be instantiable', function () {
    expect(function () {
      new Room()
    }).not.toThrow()
  })

  it('should set x and y coordinates', function () {
    var room = new Room({x: 10, y: 100})

    expect(room.getX()).toBe(10)
    expect(room.getY()).toBe(100)
  })
})
