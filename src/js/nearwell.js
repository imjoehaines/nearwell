var MapGenerator = require('./class/MapGenerator')

var map = new MapGenerator({
  width: 162,
  height: 46,
  roomOptions: {
    maxRooms: 20
  }
}).generate()

document.write('<pre>')

for (var i = 0; i < map.length; i++) {
  var row = map[i]
  for (var j = 0; j < row.length; j++) {
    document.write(row[j])
  }

  document.write('\n')
}
document.write('</pre>')
