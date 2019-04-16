// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
// var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");

// models
// var Note = require("./models/Note.js");
// var Article = require("./models/Article.js");

// scraping
// var request = require("request");
// var cheerio = require("cheerio");

// mongoose
// mongoose.Promise = Promise;

// port
var port = process.env.PORT || 3000

// initialize express
var app = express();

// Use morgan and body parser with our app
// app.use(logger("dev"));
// app.use(bodyParser.urlencoded({
//   extended: false
// }));

// Make public a static dir
app.use(express.static("public"));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

// Database configuration with mongoose
// mongoose.connect("mongodb://heroku_jmv816f9:5j1nd4taq42hi29bfm5hobeujd@ds133192.mlab.com:33192/heroku_jmv816f9");
//mongoose.connect("mongodb://localhost/mongoscraper");
// var db = mongoose.connection;

// Show any mongoose errors
// db.on("error", function(error) {
//   console.log("Mongoose Error: ", error);
// });

// Once logged in to the db through mongoose, log a success message
// db.once("open", function() {
//     console.log("Mongoose connection successful.");
//   });


// ====== ROUTES ===========

app.get("/", function (req, res) {
   console.log("hello world");
   res.render("home");
});

// port listener
app.listen(port, function () {
    console.log("App running on port " + port);
});
