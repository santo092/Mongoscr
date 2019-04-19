// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");

// models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

// Scraping tools
var request = require("request");
var cheerio = require("cheerio");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

//Define port
var port = process.env.PORT || 3000

// Initialize Express
var app = express();

// Use morgan and body parser
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// handlebars
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

// Database configuration with mongoose
// mongoose.connect("mongodb://heroku_z17gfff8:1jfssa02hssqt1fqhqhjcbc3j6@ds133275.mlab.com:33275/heroku_z17gfff8");

var MONGODB_URI = "mongodb://heroku_z17gfff8:1jfssa02hssqt1fqhqhjcbc3j6@ds133275.mlab.com:33275/heroku_z17gfff8"|| "mongodb://localhost/mongoscr";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true });

// mongodb://heroku_z17gfff8:1jfssa02hssqt1fqhqhjcbc3j6@ds133275.mlab.com:33275/heroku_z17gfff8
//mongoose.connect("mongodb://localhost/mongoscr");

// Routes
// ======

//GET requests to render Handlebars pages
app.get("/", function(req, res) {
  Article.find({"saved": false}, function(error, data) {
    var hbsObject = {
      article: data
    };
    console.log(hbsObject);
    res.render("home", hbsObject);
  });
});

app.get("/saved", function(req, res) {
  Article.find({"saved": true}).populate("notes").exec(function(error, articles) {
    var hbsObject = {
      article: articles
    };
    res.render("saved", hbsObject);
  });
});

app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://www.nytimes.com/", function(error, response, html) {
    var $ = cheerio.load(html);
    $("article").each(function(i, element) {

      var result = {};


      summary = ""
      if ($(this).find("ul").length) {
        summary = $(this).find("li").first().text();
      } else {
        summary = $(this).find("p").text();
      };

      result.title = $(this).find("h2").text();
      result.summary = summary;
      result.link = "https://www.nytimes.com" + $(this).find("a").attr("href");

      var entry = new Article(result);


      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
 
        else {
          console.log(doc);
        }
      });

    });
      // done scraping?
       res.send("Scrape Complete");

  });
});


app.get("/articles", function(req, res) {

  Article.find({}, function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});

app.get("/articles/:id", function(req, res) {
  Article.findOne({ "_id": req.params.id })
  .populate("note")
  .then(dbArticle => {
    res.json(dbArticle);
  }).catch(err => {
    res.json(err);
  });
});


app.post("/articles/save/:id", function(req, res) {
      Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true})
    
      .exec(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          res.send(doc);
        }
      });
});

app.post("/articles/delete/:id", function(req, res) {
      Article.findOneAndUpdate({ "_id": req.params.id }, {"saved": false, "notes": []})
      .exec(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          res.send(doc);
        }
      });
});


app.post("/notes/save/:id", function(req, res) {
  var newNote = new Note({
    body: req.body.text,
    article: req.params.id
  });
  console.log(req.body)
  newNote.save(function(error, note) {
    if (error) {
      console.log(error);
    }
    else {
      Article.findOneAndUpdate({ "_id": req.params.id }, {$push: { "notes": note } })
      .exec(function(err) {
        if (err) {
          console.log(err);
          res.send(err);
        }
        else {
          res.send(note);
        }
      });
    }
  });
});

app.delete("/notes/delete/:note_id/:article_id", function(req, res) {
  Note.findOneAndRemove({ "_id": req.params.note_id }, function(err) {
    if (err) {
      console.log(err);
      res.send(err);
    }
    else {
      Article.findOneAndUpdate({ "_id": req.params.article_id }, {$pull: {"notes": req.params.note_id}})
        .exec(function(err) {
          if (err) {
            console.log(err);
            res.send(err);
          }
          else {
            res.send("Note Deleted");
          }
        });
    }
  });
});

// Listen on port
app.listen(port, function() {
  console.log("App running on port " + port);
});

