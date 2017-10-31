require('dotenv').config();
var express = require('express');
var metrics = require('./routes/metrics');
var settings = require("./settings")

var app = express();

module.exports = app;

app.use('/', metrics);
app.use(express.static('public'));