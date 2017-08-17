// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

var GoogleImages = require('google-images');

var mongo = require('mongodb').MongoClient

// DEVELOPMENT
if (!process.env.PORT) {
  var env = require('./env');
}

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.get("/api/imagesearch/:searchTerm", function (req, res) {
    
    var searchTerm = req.params.searchTerm
    if (searchTerm) {
      var client = new GoogleImages(process.env.CSE_ID, process.env.API_KEY);

      var pageNum = req.query.offset || 1

      var newSearch = {
        searchTerm: searchTerm,
        offset: pageNum
      }

      mongo.connect(process.env.MONGO_URL, function(err, db) {
        if (err) res.sendStatus(500).send('An error happened while connecting to database')
        db.collection('searchCol')
          .insert(newSearch, function(err, data) {
            if (err) res.sendStatus(500).send('An error happened while saving data')
            client.search(searchTerm, {page: pageNum})
              .then(images => res.json(images.map(image => ({
                url: image.url,
                alt: image.description,
                pageUrl: image.parentPage
              }))))
            db.close()
          })
      })
     
    } else {
      res.end('Please give a search term.')
    }
});

app.get("/api/latest/imagesearch/", function (req, res) {
  mongo.connect(process.env.MONGO_URL, function(err, db) {
    if (err) res.sendStatus(500).send('An error happened while connecting to database')
    db.collection('searchCol')
      .find({}, {
        _id: 0,
        searchTerm: 1,
        offset: 1
      })
      .toArray(function(err, docs) {
        if (err) res.sendStatus(500).send('An error happened while finding data')
        if (docs.length > 0) {
          res.json(docs)
        } else {
          res.end('No recent searches.')
        }
        db.close()
      })
  })
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
var listener = app.listen(process.env.PORT || '3939', function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
