module.exports = createOrderItem = (item) => {
  const table = document.querySelector("#bookRow");

  const rowCount = table.rows.length;
  const row = table.insertRow(rowCount);

  row.insertCell(0).innerHTML= rowCount;
  row.insertCell(1).innerHTML= item.book.title;
  row.insertCell(2).innerHTML= item.book.author;
  row.insertCell(3).innerHTML= item.book.isbn;
  row.insertCell(4).innerHTML= '<input type="text" id="quantity" value="1" size="1" style="text-align:right;" name="item[quantity]">';
  row.insertCell(5).innerHTML= item.price;
  row.insertCell(6).innerHTML= item.vendor;
  row.insertCell(7).innerHTML= '<input type="button" class="btn btn-warning" value="Remove Book" onclick="RemoveBookRow(this)">';
}

