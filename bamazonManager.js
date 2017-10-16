const mysql = require("mysql");
const inquirer = require("inquirer");
const table = require("cli-table");

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
	mainMenu();
})

function mainMenu() {
  inquirer.prompt([
  {
    type: "list",
    message: "Choose an action below:",
    name: "menu",
    default: "View Products for Sale",
    choices: ["View Products for Sale","View Low Inventory", "Add to Inventory", "Add New Product"]
  }
    ]).then(function(choice) {
      if(choice.menu === "View Products for Sale") {
        viewProducts();
        } else if (choice.menu === "View Low Inventory") {
          lowInventory();
        } else if (choice.menu === "Add to Inventory") {
          addInventory();
        } else if (choice.menu === "Add New Product") {
          addProduct();
        }
      });
  }

function viewProducts() {
  connection.query("select * from products", function(err,resp) {
      if(err) throw err;

        var productTable = new table ({
          head: ['Item ID','Product Name', 'Price','Qantity'],
          colWidths:[10,40,10,10]
        });

      for (i=0; i < resp.length; i++) {

        productTable.push (
          [resp[i].item_id, resp[i].product_name, "$"+resp[i].price, resp[i].stock_quantity]
          );
       }

        console.log(productTable.toString());
      });
  connection.end();
}

function lowInventory() {
  connection.query("select product_name from products where stock_quantity <=5",  
    function(err,resp) {
      if(err) throw err;
      console.log("These are the products that have 5 or less items:");

      for (i=0; i < resp.length; i++) {
      console.log(resp[i].product_name);
        }
    });
  connection.end();
}


function addInventory() {
  inquirer.prompt([
    {
      message: "What product to you want to add to?",
      name: "product"
    },
    {
      message: "How many more?",
      name: "add_quantity",
      validate: value => !isNaN(value)
    }
    ]).then (function(responses) { 
      var prodName = responses.product;
      var prodQuantity = responses.add_quantity;
      connection.query("update products set stock_quantity=stock_quantity+? where product_name like ?", 
        [prodQuantity,'%'+prodName+'%'], function(err,resp) {
          if(err) throw err;
          queryQuantity(prodName);

        });
      });
}


function queryQuantity(prodName) {
  // console.log(prodName);
    connection.query("select stock_quantity from products where product_name like ?", ['%'+prodName+'%'], function(err,resp) {

      if(err) throw err;
      const newQuantity = resp[0].stock_quantity;
      console.log(`There are now ${newQuantity} items`);
    });
      connection.end();
}

function addProduct() {
  inquirer.prompt([
  {
    message: "Enter the product name: ",
    name: "product"
  },
  {
    message: "Enter the quantity: ",
    name: "quantity"
  },
  {
    message: "Enter the price: ",
    name: "price"
  },
  {
    message: "Enter the department: ",
    name: "department"
  }
    ]).then(function(productToAdd) {
      connection.query("insert into products (product_name,stock_quantity,price,department_name) values(?,?,?,?)",
        [productToAdd.product,productToAdd.quantity,productToAdd.price,productToAdd.department], 
        function(err, resp) {
          if(err) throw err;
          console.log(`You've added the item to the list!`);
        });
      connection.end();
    });
  }
  

