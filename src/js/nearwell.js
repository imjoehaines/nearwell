var MapGenerator = require('./class/MapGenerator')

var map = new MapGenerator({
  width: 100,
  height: 50,
  roomOptions: {
    maxRooms: 10,
    minRoomSize: 5
  }
}).generate()

var Potion = require('potion')

var colours = {
  ' ': '#fff',
  '.': '#ccc',
  '#': '#555'
}

var app = Potion.init(document.getElementById('game'), {
  configure: function () {
    this.setSize(1000, 500)
  },

  init: function () {
    this.size = 10
  },

  update: function (time) {

  },

  render: function () {
    for (var i = 0; i < map.length; i++) {
      var row = map[i]
      for (var j = 0; j < row.length; j++) {
        app.video.ctx.fillStyle = colours[row[j].character]
        app.video.ctx.fillRect(j * 10, i * 10, 10, 10)
      }
    }
  }
})
