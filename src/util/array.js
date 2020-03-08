module.exports = {
  partition,
}

function partition(array, numInRow) {
  const rows = [];
  let row = [];
  for (let i = 0; i < array.length; i++) {
    row.push(array[i]);
    if (row.length === numInRow) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length) rows.push(row);
  return rows.filter((r) => r.length);
}
