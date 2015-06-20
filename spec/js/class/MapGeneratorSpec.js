/*global describe, it, expect */
var MapGenerator = require('../../../src/js/class/MapGenerator')

describe('MapGenerator', function () {
  it('should be instantiable', function () {
    expect(function () {
      new MapGenerator() // eslint-disable-line no-new
    }).not.toThrow()

    expect(new MapGenerator() instanceof MapGenerator).toBe(true)
  })

  describe('Options', function () {
    it('should set a default width', function () {
      expect(new MapGenerator().width).toBe(100)
    })

    it('should set a width when given', function () {
      expect(new MapGenerator({width: 20}).width).toBe(20)
    })

    it('should set a default height', function () {
      expect(new MapGenerator().height).toBe(100)
    })

    it('should set a height when given', function () {
      expect(new MapGenerator({height: 2000}).height).toBe(2000)
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
          new MapGenerator({mapType: 'no way'}) // eslint-disable-line no-new
        }).toThrow()
      })
    })
  })
})
