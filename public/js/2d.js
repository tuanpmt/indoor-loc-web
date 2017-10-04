var defaultAnchors = [{
  addr: 0xABCD,
  locx: 1.1,
  locy: 1.2
}, {
  addr: 0xDEFA,
  locx: 1.1,
  locy: 1.2
}];

var anchors = [];

function deleteRow(row) {

  var idx = row.parentNode.parentNode.rowIndex;
  anchors.splice(idx - 1, 1);
  save(anchors);
  createTable('postable', anchors);
}

function addRow(row) {
  var addr = parseInt(document.getElementById('addr').value, 16);
  var locx = parseFloat(document.getElementById('locx').value);
  var locy = parseFloat(document.getElementById('locy').value);
  if(!addr || locy == NaN || locy == NaN)
    return;
  var newRow = {
    addr: addr,
    locx: document.getElementById('locx').value,
    locy: document.getElementById('locy').value
  }
  anchors.push(newRow);
  save(anchors);
  createTable('postable', anchors);
}

function createTable(id, tableData) {
  var table = document.getElementById(id);
  var tableBody = document.createElement('tbody');

  tableData.forEach(function(rowData) {
    var row = document.createElement('tr');

    var cell = document.createElement('td');
    cell.appendChild(document.createTextNode(rowData.addr.toString(16)));
    row.appendChild(cell);

    cell = document.createElement('td');
    cell.appendChild(document.createTextNode(rowData.locx));
    row.appendChild(cell);

    cell = document.createElement('td');
    cell.appendChild(document.createTextNode(rowData.locy));
    row.appendChild(cell);

    cell = document.createElement('td');
    cell.innerHTML = '<input class="button-primary" type="button" value="Remove" onclick="deleteRow(this)">';
    row.appendChild(cell);

    
    tableBody.appendChild(row);
  });
  table.replaceChild(tableBody, table.getElementsByTagName('tbody')[0]);
}
function save(data)
{
  localStorage.setItem("anchors", JSON.stringify(data));
}
function load()
{
  anchors = JSON.parse(localStorage.getItem("anchors"));
  if(!anchors) {
    anchors = defaultAnchors;
    save(defaultAnchors)
  }
  createTable('postable', anchors);
}

load();
// localStorage.setItem("anchors",null);
// save(null)
