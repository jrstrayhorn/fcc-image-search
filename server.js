// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

var GoogleImages = require('google-images');

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
      client.search(searchTerm, {page: pageNum})
        .then(images => res.json(images.map(image => ({
          url: image.url,
          alt: image.description,
          pageUrl: image.parentPage
        }))))
      //res.json(results)
    } else {
      res.end('Please give a search term.')
    }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/dreams", function (request, response) {
  response.send(dreams);
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});

// Simple in-memory store for now
var dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// listen for requests :)
var listener = app.listen(process.env.PORT || '3939', function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
