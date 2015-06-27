var MapGenerator = require('./class/MapGenerator')

var mapGenerator = new MapGenerator({
  width: 50,
  height: 25,
  roomOptions: {
    maxRooms: 10,
    minRoomSize: 5
  }
})

var map = mapGenerator.generate()
var startPosition = mapGenerator.getStartPosition()
var Potion = require('potion')

var colours = {
  ' ': '#fff',
  '.': '#ccc',
  '#': '#555'
}

var app = Potion.init(document.getElementById('game'), {
  configure: function () {
    this.setSize(1000, 500)
    this.y = startPosition.x * 20 + 20
    this.x = startPosition.y * 20 + 20
  },

  init: function () {
    this.size = 20
  },

  update: function (time) {
    if (app.input.isKeyDown('w')) { this.y -= this.size }
    if (app.input.isKeyDown('d')) { this.x += this.size }
    if (app.input.isKeyDown('s')) { this.y += this.size }
    if (app.input.isKeyDown('a')) { this.x -= this.size }

    app.input.resetKeys()
  },

  render: function () {
    for (var i = 0; i < map.length; i++) {
      var row = map[i]
      for (var j = 0; j < row.length; j++) {
        app.video.ctx.fillStyle = colours[row[j].character]
        app.video.ctx.fillRect(j * this.size, i * this.size, this.size, this.size)
      }
    }

    app.video.ctx.fillStyle = 'red'
    app.video.ctx.fillRect(this.x, this.y, this.size, this.size)
  }
})
