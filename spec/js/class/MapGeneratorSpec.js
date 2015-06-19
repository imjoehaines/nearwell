/*global describe, it, expect */
var _ = require('lodash')
var MapGenerator = require('../../../src/js/class/MapGenerator.js')

describe('MapGenerator', function () {
  it('should be instantiable', function () {
    expect(function () {
      new MapGenerator()
    }).not.toThrow()

    expect(new MapGenerator() instanceof MapGenerator).toBe(true)
  })

  it('should set a width', function () {
    expect(new MapGenerator().width).toBe(100)
  })

  it('should set a height', function () {
    expect(new MapGenerator().height).toBe(100)
  })

  describe('Map types', function () {
    it('should set a default map type', function () {
      expect(new MapGenerator().getMapType()).toBe('dungeon')
    })

    it('should set a map type', function () {
      expect(new MapGenerator({mapType: 'dungeon'}).getMapType()).toBe('dungeon')
    })

    it('should throw an error if given an invalid map type', function () {
      expect(function () {
        new MapGenerator({mapType: 'no way'})
      }).toThrow()
    })
  })

  describe('Map generation', function () {
    var validCharacters = [' ', '.', '#']

    it('should return an array', function () {
      expect(new MapGenerator().generate() instanceof Array).toBe(true)
    })

    it('should build a two dimentional array of valid characters', function () {
      var generatedMap = new MapGenerator({width: 3, height: 2}).generate()

      // check width & height
      expect(generatedMap.length).toBe(2)
      expect(generatedMap[0].length).toBe(3)

      // check dimentions after stripping all valid characters
      expect(_.map(generatedMap, function (row) {
        return _.difference(row, validCharacters)
      })).toEqual([[], []])
    })
  })
})
