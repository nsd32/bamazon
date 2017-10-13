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

function displayTable() {
	connection.query("SELECT products.item_id, products.product_name, departments.department_name, products.price, products.stock_quantity FROM products INNER JOIN departments ON products.department_id = departments.department_id", function(err, res) {
		if (err) throw err;
		// console.log(res);
		var table = new AsciiTable('Products')

		table.setHeading('item_id', 'product_name', 'department_name', 'price', 'quantity')

		for (var i = 0; i < res.length; i++) {
			table.addRow(res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity);
		}

		console.log(table.toString());
		connection.end();
	})
}

function displayProducts() {
	connection.query("SELECT products.item_id, products.product_name, departments.department_name, products.price, products.stock_quantity FROM products INNER JOIN departments ON products.department_id = departments.department_id", function(err, res) {
		if (err) throw err;
		// console.log(res);
		var table = new AsciiTable('Products')

		table.setHeading('item_id', 'product_name', 'department_name', 'price', 'quantity')

		for (var i = 0; i < res.length; i++) {
			table.addRow(res[i].item_id, res[i].product_name, res[i].price, res[i].department_name, res[i].stock_quantity);
		}
		
		console.log(table.toString());
		addMore();
	})
}

function viewLowInventory() {
	connection.query("SELECT products.item_id, products.product_name, departments.department_name, products.price, products.stock_quantity FROM products INNER JOIN departments ON products.department_id = departments.department_id", function(err, res) {
		if (err) throw err;
		// console.log(res);
		var table = new AsciiTable('Products')

		table.setHeading('item_id', 'product_name', 'department_name', 'price', 'quantity')

		for (var i = 0; i < res.length; i++) {
			if (res[i].stock_quantity < 5) {
				table.addRow(res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity);
			}
		}
		
		console.log(table.toString());
		connection.end();
	})
}

function addMore() {

	inquirer.prompt([

	  {
	    type: 'input',
		  message: 'Enter the Product ID of the item you would like to add to',
		  name: 'productId'
	  },
	  {
	    type: 'input',
		  message: 'How many units of the product would you like to add?',
		  name: 'units'
	  }
	]).then(function(response) {
			var query = "SELECT * FROM products WHERE ?"
			connection.query(query, { item_id: response.productId }, function(err, res) {
				if (err) throw err;
				
				var updateQuantity = parseInt(res[0].stock_quantity) + parseInt(response.units);
				
				var update = "UPDATE products SET ? WHERE ?"
				connection.query(update, 
					[
						{ 
							stock_quantity: updateQuantity
						}, 
						{ 
							item_id: response.productId
						}
					],
					function(err, res) {
						if(err) throw err;
						console.log("Your update has been processed!");
						displayTable();
					}
				);
				
			});
	})
}

function getDepartments() {
	connection.query("SELECT department_name FROM products GROUP BY department_name",
		function(err, res) {
			if (err) throw err;
			var array = [];
			for (var i = 0; i < res.length; i++) {
				array.push(res[i].department_name);
			}
			return array;
		}
	);
}

function newProduct() {
	var departments = [];
	connection.query("SELECT department_id, department_name FROM departments",
		function(err, res) {
			if (err) throw err;
			// console.log(res[0].department_id);
			for (var i = 0; i < res.length; i++) {	
				departments.push(`${res[i].department_id} ${res[i].department_name}`);
			}
		}
	);

	inquirer.prompt([
	  {
	    type: 'input',
		  message: 'What is the name of the new product?',
		  name: 'productName'
	  },
	  {
	    type: 'input',
		  message: 'What is the price per unit?',
		  name: 'price'
	  },
	  {
	    type: 'input',
		  message: 'How many are in stock?',
		  name: 'quantity'
	  }
	]).then(function(response) {

			inquirer.prompt([
				{
			    type: 'list',
				  name: 'department',
				  message: 'What department will the product be in?',
				  choices: departments
		    },
			]).then(function(answer) {
				var deptId = answer.department.split(" ")[0];
				connection.query("INSERT INTO products SET ?", 
				{
					product_name: response.productName,
					department_id: deptId,
					price: response.price,
					stock_quantity: response.quantity
				},
					function(err) {
					if (err) throw err;
					console.log('Your product has been added!');
					displayTable();
				});
		  });
	})
}

inquirer.prompt([
	{
    type: 'list',
	  name: 'menu',
	  message: 'What would you like to do?',
	  choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product']
  }
]).then(function(response) {
	if (response.menu === 'View Products for Sale') {
		displayTable();
	} else if (response.menu === 'View Low Inventory') {
		viewLowInventory();
	} else if (response.menu === 'Add to Inventory') {
		displayProducts();
	} else if (response.menu === 'Add New Product') {
		newProduct();
	}
})