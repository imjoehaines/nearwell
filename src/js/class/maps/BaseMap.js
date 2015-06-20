'use strict'

var _ = require('lodash')

var defaults = {width: 100, height: 100}

var BaseMap = function (options) {
  options = _.merge({}, defaults, options)

  this.width = options.width
  this.height = options.height
}

/**
 * Generates the inital map for all map types
 *
 * @return {Array}
 */
BaseMap.prototype.generateInitialMap = function () {
  var map = []

  for (var y = 0; y < this.height; y++) {
    var row = []
    for (var x = 0; x < this.width; x++) {
      row.push(' ')
    }

    map.push(row)
  }

  return map
}

module.exports = BaseMap
