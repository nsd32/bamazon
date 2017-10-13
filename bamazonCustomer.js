var mysql = require('mysql');
var inquirer = require('inquirer');
var AsciiTable = require('ascii-table');

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "",
	database: "bamazon"
});

connection.connect(function(err) {
	if (err) throw err;
	console.log("Connected as id: " + connection.threadId);
	displayTable();
});

function createProduct() {
	console.log("Inserting new product...\n");
	var query = connection.query(
		"INSERT INTO products SET ?",
		{
			product_name: "Silver Ware",
			department_name: "Kitchen",
			price: 35,
			stock_quantity: 22
		},
		function(err, res) {
			if (err) throw err;
			console.log(res.affectedRows + " product inserted!\n");
		}
	);
	console.log(query.sql);
	connection.end();
}

function displayTable() {
	connection.query("SELECT * FROM products", function(err, res) {
		if (err) throw err;
		// console.log(res);
		var table = new AsciiTable('Products')

		// for (var j = 0; j < res.length; j++) {
		// 	var obj = res[j];
		// 	for (var key in obj) {
		// 		table.setHeading(obj[key])
		// 	}
		// }
		table.setHeading('item_id', 'product_name', 'price')

		for (var i = 0; i < res.length; i++) {
			table.addRow(res[i].item_id, res[i].product_name, res[i].price)
		}

		console.log(table.toString());
		placeOrder();
	})
}

function placeOrder() {
	inquirer.prompt([

	  {
	    type: 'input',
		  message: 'Enter the Product ID of the item you would like to purchase',
		  name: 'productId'
	  },
	  {
	    type: 'input',
		  message: 'How many units of the product would you like to purchase?',
		  name: 'units'
	  }
	]).then(function(response) {
		  var query = "SELECT * FROM products WHERE ?"
			connection.query(query, { item_id: response.productId }, function(err, res) {
				if (err) throw err;
				// console.log(res.stock_quantity);
				if (res[0].stock_quantity < response.units) {
					console.log("Insufficient Quantity!")
				} else {
					var currentQuantity = res[0].stock_quantity;
					var productPrice = res[0].price;
					var totalCost = productPrice * response.units;
					var sales = res[0].product_sales + totalCost;
					var updateProduct = "UPDATE products SET ? WHERE ?"
					connection.query(updateProduct, 
						[
							{ 
								stock_quantity: currentQuantity - response.units,
								product_sales: sales 
							}, 
							{ 
								item_id: response.productId 
							}
						],
						function(err, res) {
							if(err) throw err;
							console.log("Your order has been processed!");
							console.log("Your total cost is: " + "$" + totalCost);
							connection.end();
						}
					);
				}
			});	
	});
}

// var table = new AsciiTable('Products')
// table
// 	.setHeading('item_id', 'product_name', 'department_name', 'price', 'stock_quantity')
// 	.addRow()
