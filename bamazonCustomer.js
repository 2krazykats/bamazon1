const mysql = require("mysql");
const inquirer = require("inquirer");
const Table = require("cli-table");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  // Your username
  user: "root",
  // Your password
  password: "r00t",
  database: "bamazon"
});

connection.connect(function(err) {
	if(err) throw err;
	console.log(`connected using id ${connection.threadId}`);
	queryAllProducts();
})

var productTable = new Table ({
          head: ['Item ID','Product Name', 'Price'],
          colWidths:[10,40,10]
        });


function queryAllProducts() {
	connection.query("select * from products", function(err, resp) {
		if(err) throw err;
			for (var i = 0; i < resp.length; i++) {
			// console.log(response[i]);
			// console.log("-------------------");
			productTable.push (
	          [resp[1].item_id,resp[i].product_name, "$"+resp[i].price]
	          );
		}
        console.log(productTable.toString());
		searchProduct();
	});
}

function searchProduct() {

	inquirer
		.prompt([
			{
				name: "product_name",
				message: "Enter the name of the product: "
			},
			{
				name: "quantity",
				message: "How many would you like to buy: "
			}
		]).then(function(order) {
			// console.log(order.product_name);
			// console.log(order.quantity);
		connection.query(`select stock_quantity,price,product_name from products where product_name like '%${order.product_name}%'`,
			function(err, response) {
				if(err) throw err;
				// console.log(response[0].stock_quantity);

				if (response[0].stock_quantity >= order.quantity) {
				// var returnedCount = response[0].stock_quantity;
					updateProduct(order.product_name, order.quantity, response[0].price);
					// queryQuantity(response[0].stock_quantity, response[0].product_name);
					queryQuantity(response[0].product_name);
				} else {
					console.log("Insufficient quantity");
					queryQuantity(response[0].product_name);
				}
		})
	});
}

function updateProduct(product_name, stock_quantity, price) {
	connection.query(` update products set stock_quantity = (stock_quantity - ${stock_quantity}) 
	where product_name like '%${product_name}%'`, function(err, response) {
		if(err) throw err;

		var totalCost = stock_quantity * price;
		console.log(`Your total cost is: $${totalCost}`);
	} );

}

function queryQuantity(product_name) {
	connection.query(`select stock_quantity from products where product_name like '%${product_name}%'`, 
			function(err, response) {
				console.log(`There are currently ${response[0].stock_quantity} ${product_name} left.`);
			});

	    connection.end();
}