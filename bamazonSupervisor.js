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


function viewByDepartment() {
	connection.query("SELECT departments.department_id, departments.department_name, over_head_costs, SUM(product_sales) AS product_sales FROM departments INNER JOIN products ON departments.department_id = products.department_id GROUP BY departments.department_id", function(err, res) {
		if (err) throw err;
		// console.log(res);
		var table = new AsciiTable('Product Sales by Department');
		table.setHeading('department_id', 'department_name', 'over_head_costs', 'product_sales', 'total_profit');

		for (var i = 0; i < res.length; i++) {
			table.addRow(res[i].department_id, res[i].department_name, res[i].over_head_costs, res[i].product_sales, (parseInt(res[i].product_sales) - parseInt(res[i].over_head_costs)));
		}

		console.log(table.toString());
		connection.end();
	})
}

function displayDepartments() {
	connection.query("SELECT * FROM departments", function(err, res) {
		if (err) throw err;
		// console.log(res);
		var table = new AsciiTable('Departments');

		table.setHeading('department_id', 'department_name', 'over_head_costs')

		for (var i = 0; i < res.length; i++) {
			table.addRow(res[i].department_id, res[i].department_name, res[i].over_head_costs);
		}

		console.log(table.toString());
		connection.end();
	})
}

function newDepartment() {
	inquirer.prompt([
		{
	    type: 'input',
		  message: 'What is the name of the new department?',
		  name: 'departmentName'
	  },
	  {
	    type: 'input',
		  message: 'What are the over-head costs?',
		  name: 'costs'
	  }
	]).then(function(response) {
			connection.query("INSERT INTO departments SET ?", 
			{
				department_name: response.departmentName,
				over_head_costs: response.costs
			},
				function(err) {
				if (err) throw err;
				console.log('Your department has been added!');
				displayDepartments()
			});
	})
}


inquirer.prompt([
	{
    type: 'list',
	  name: 'department',
	  message: 'What would you like to do?',
	  choices: ["View Product Sales by Department", "Create New Department"]
  }
]).then(function(response) {
		if (response.department === "View Product Sales by Department") {
			viewByDepartment();
	  } else if (response.department === "Create New Department") {
	  	newDepartment();
	  }
})