module.exports = {
  partition: partition,
}

function partition(array, numInRow) {
  var rows = [];
  var row = [];
  for (var i = 0; i < array.length; i++) {
    row.push(array[i]);
    if (row.length === numInRow) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length) { rows.push(row); }
  return rows.filter(function (r) { return r.length; });
}
