/*global describe, it, expect */
var _ = require('lodash')
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
      expect(_.map(generatedMap, function (row) {
        return _.difference(row, TileTypes.validTypes)
      })).toEqual([[], []])
    })
  })
})
