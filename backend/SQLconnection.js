var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "mav5499",
  password: "password"
});
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});