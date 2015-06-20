'use strict'

var BaseMap = require('./BaseMap')

var Dungeon = function () {
  // extend the BaseMap class
  BaseMap.apply(this, arguments)
}

Dungeon.prototype = Object.create(BaseMap.prototype)
Dungeon.prototype.constructor = Dungeon

module.exports = Dungeon
