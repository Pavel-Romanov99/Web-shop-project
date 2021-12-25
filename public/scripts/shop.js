function hover1(element) {
  element.setAttribute('src', '../public/photos/jacket1-1.jpg');
}

function unhover1(element) {
  element.setAttribute('src', '../public/photos/jacket1.jpg');
}

function hover2(element) {
  element.setAttribute('src', '../public/photos/jacket2-2.jpg');
}

function unhover2(element) {
  element.setAttribute('src', '../public/photos/jacket2.jpg');
}
function hover3(element) {
  element.setAttribute('src', '../public/photos/jacket3-3.jpg');
}

function unhover3(element) {
  element.setAttribute('src', '../public/photos/jacket3.jpg');
}
function hover4(element) {
  element.setAttribute('src', '../public/photos/jacket4-4.jpg');
}

function unhover4(element) {
  element.setAttribute('src', '../public/photos/jacket4.jpg');
}
function hover5(element) {
  element.setAttribute('src', '../public/photos/jacket5-5.jpg');
}

function unhover5(element) {
  element.setAttribute('src', '../public/photos/jacket5.jpg');
}
function hover6(element) {
  element.setAttribute('src', '../public/photos/jacket6-6.jpg');
}

function unhover6(element) {
  element.setAttribute('src', '../public/photos/jacket6.jpg');
}


var total = 0; //total money
var i = 1;
var itemCost = [];


function add(n) {
  //which clothing price and size to take
  var clothing = "clothing" + n; //brand
  var price = "price" + n;
  var size = "size" + n;
  var quantityId = "quantity" + n;


  var size_data = document.getElementById(size).value;
  if (size_data === "size") {
    alert("Please select a size")
    return 0;
  }
  var clothing_data = document.getElementsByClassName(clothing)[0].innerHTML;
  var price_data = document.getElementsByClassName(price)[0].innerHTML;
  var quantity_data = document.getElementById(quantityId).value;

  var tr = document.createElement('tr');
  item = "item" + i;
  tr.setAttribute("id", item)

  itemCost[i - 1] = Number(price_data) * Number(quantity_data);
  i++;

  var td1 = document.createElement('td');
  td1.innerHTML = clothing_data;
  var td2 = document.createElement('td');
  td2.innerHTML = size_data;
  var td3 = document.createElement('td');
  td3.innerHTML = price_data;
  var td4 = document.createElement('td');
  td4.innerHTML = quantity_data;


  tr.appendChild(td1);
  tr.appendChild(td2);
  tr.appendChild(td3);
  tr.appendChild(td4);

  const table1 = document.getElementsByClassName('shopping-cart');
  table1[0].appendChild(tr);

  total += Number(price_data) * Number(quantity_data);
  console.log(total);
  document.getElementsByClassName("total")[0].innerHTML = "Total: " + total.toFixed(2) + " $";
  document.getElementById(item).innerHTML += '<button class="delete" onclick="deleItem(' + "'" + item + "'" + ')">x</button>';
}


function deleItem(eId) {
  document.getElementById(eId).remove();
  n = Number(eId.slice(-1)) - 1;
  total -= itemCost[n];
  document.getElementsByClassName("total")[0].innerHTML = "Total: " + total.toFixed(2) + " $";
}