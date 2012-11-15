var express = require('express'),
    app = express(),
    rest = require('restler'), 
    sys = require("sys"),
    fs = require('fs');
    
app.use(express.static(__dirname));

app.listen(8083);
console.log('Started up successfully.');
