// REQUIRED PACKAGES AND FILES 
let mysql = require ('mysql');
let inquirer = require ('inquirer');
let table = require ('terminal-table');


// MySQL SERVER CONNECTION / PARAMETERS 
let connection = mysql.createConnection({
    host:'localhost',
    port: 3306, 

         // USERNAME 
    user: "root", 
    password: "Steph2845", // SET UP DOTENV? PUT PASSWORD THERE SO NOT ON GITHUB.....

         //DATABASE
    database: "bamazon"
});
          // FINISH CONNECTION 
    connection.connect(function (err) {
        if (err) throw err;
        console.log("connected at port" + connection.threadId);
        displayItems();
});

// CUSTOMER FUNCTION 
function runCustomer(arr) {
    let idArr = arr
    // QUESTION 1: PROMPT CUSTOMER WHICH ITEM TO PURCHASE 
    inquirer.prompt([{
            type: "input",
            name: "itemId",
            message: "Enter ID of the product you would like to buy:",
            validate: function (input) {
                if (idArr.includes(parseInt(input))) {
                    return true
                }
                // PROMPT FOR INVALID ITEM ID 
                console.log("Invalid ID. Please enter a valid product ID.")
                return false
            }
        }])
        .then(answers => {
            selectedId = answers.itemId
            return dbConnection.query('SELECT * FROM products WHERE ?', {
                id: answers.itemId
            })
        })
        .then(product => {
            selectedProd = product[0].product_name
            price = product[0].price
            rev = product[0].product_sales
            stock = product[0].stock_quantity
            // SECOND QUESTION: QUANITY OF ITEM DESIRED 
            return inquirer.prompt([{
                type: "input",
                name: "prodAmount",
                message: "Please enter the quantity needed of ${(selectedProd)} you would like to buy:",
                validate: function (input) {
                    if (isNaN(input) || input < 0) {
                        console.log("Only positive numbers allowed. Please try again.") 
                        return false
                    } else if (input === '') {
                        console.log("Please reenter a quantity.")
                        return false
                        // IF QUANITY IS > THAN STOCK AMOUNT OF ITEM
                    } else if (input > stock) {
                        console.log("\n\n" + ` Unfortunately there are only ${(stock)} units of ${(selectedProd)} in stock. Please enter a quantity less than or equal to ${(stock)}.` + "\n")
                        return false
                    }
                    return true
                }
            }])
        })
        .then(answers => buyThings(selectedProd, answers.prodAmount, stock, price, rev))
}


// INVENTORY DISPLAY FUNCTION 
function displayItems() {
    console.log("------------ PRODUCTS FOR SALE -------------\n");
    connection.query("SELECT * FROM  products", function (err, res) {
        if (err) throw err
        // FUNCTION SHOWS AVAILABLE PRODUCTS
        console.log(res);
        console.log("\n\n");
        
        inquirer.prompt([
            {
                name: "itemID",
                type: "input",
                message: "What is the ID number of the product you would like to buy?",
            },
            {
                name: "amountItem",
                type: "input",
                message: "How many units would you like to buy?"
            }]).then(function (answer) {
               
                let chosenProd = answer.itemID;
                console.log(chosenProd)
                let quantity = answer.amountItem;
                connection.query(`SELECT * FROM products WHERE item_id = ${chosenProd}`, function (err,res) {
                    if (err) throw err;
                    let item = res[0];
                    checkInventory(item, answer)
                });
            });
    });
};

// CHECK INVENTORY FUNCTION 
let checkInventory = function (item, userSelections) {
    if (userSelections.amountItem <= item.stock_quantity) {
        console.log("We have enough!")
        purchaseFunc(item, userSelections);
    } else {
        console.log("We do not have enough")
        // RECURSION TO OPTIMIZE USER EXPERIENCE SO THAT APP CAN RUN AGAIN IF QUANITY = INSUFFICIENT 
        displayItems();
    }
}


// PURCHASE FUNCTION 
 const purchaseFunc = function (item, userSelections) {
     let newQuantity = item.stock_quantity - userSelections.amountItem;
     connection.query(`UPDATE products SET stock_quantity = ${newQuantity} WHERE item_id = ${item.item_id}`, function(err, response) {
         if (err) throw err;
        
         // console log here that shows user the total price of purchase
         console.log(response)
     })
 }
 // Use inquirer prompt to ask user if they wqant to continue shopping 
 const stillShopping = function(){
     inquirer.prompt([{
         type: "yes",
         message: "Continue to shop?",
         name: "true",
         default: "true"
     }])
     .then(function(response){
         if (response.true){
             displayItems();
         } else {
             console.log("Thank you! Please visit again!");
             connection.end();
         }
     })
 };