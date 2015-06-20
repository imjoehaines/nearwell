/*global describe, it, expect */
var map = require('lodash/collection/map')
var difference = require('lodash/array/difference')
var BaseMap = require('../../../../src/js/class/maps/BaseMap')
var TileTypes = require('../../../../src/js/helpers/TileTypes')

describe('BaseMap', function () {
  it('should be instantiable', function () {
    expect(function () {
      new BaseMap() // eslint-disable-line no-new
    }).not.toThrow()
  })

  describe('Map generation', function () {
    it('should return an array', function () {
      expect(new BaseMap().generateInitialMap() instanceof Array).toBe(true)
    })

    it('should build a two dimentional array of valid characters', function () {
      var generatedMap = new BaseMap({width: 3, height: 2}).generateInitialMap()

      // check width & height
      expect(generatedMap.length).toBe(2)
      expect(generatedMap[0].length).toBe(3)

      // check dimentions after stripping all valid characters
      expect(map(generatedMap, function (row) {
        return difference(row, TileTypes.validTypes)
      })).toEqual([[], []])
    })
  })
})
