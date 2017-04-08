const http = require('http');
var express = require('express');
var parser = require('body-parser');
var ngrok = require('ngrok');

var app = express();

app.use(parser.json());
app.get('/', function(req, res) {
    res.send('hello world!');
})

app.post('/', function(req, res) {
    res.send('received a POST request!');
    var json = req.body[0];
    var msys = req.body.msys;
    console.log("POST body:\n");
    console.log(json);

})

app.listen(3000, function() {
    console.log('example listening on port 3000');
})
