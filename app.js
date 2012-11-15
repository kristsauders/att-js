var express = require('express'),
    app = express(),
    rest = require('restler'), 
    sys = require("sys"),
    fs = require('fs');
    
//CORS middleware
var allowCrossDomain = function(req, res, next) {
    console.log(req.headers);
    //if(req.headers.origin)
        //res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Max-Age', '600');
    res.header('Access-Control-Allow-Headers', 'Content-Type,UDID,X-Speech-Context,User-Agent,ClientId,ClientSecret,Authorization');

    next();
}

//app.use(express.static(__dirname));
//app.use(allowCrossDomain);

// Body parsing here
app.use (function(req, res, next) {
    var data='';
    req.setEncoding('utf8');
    req.on('data', function(chunk) { 
       data += chunk;
    });

    req.on('end', function() {
        req.body = data;
        next();
    });
});

app.all('*', function(req, res){
    var options = {};
    options.data = req.body;
    options.headers = req.headers;
    options.headers.host = 'api.att.com';
    delete options.headers.origin;
    options.query = req.query;
    console.log(req.method + ': ' + req.path);
    
    if(req.method=='GET') {
        rest.get('https://api.att.com' + req.path, req).on('complete', function(data) {
          if (data instanceof Error) {
            sys.puts('Error: ' + data.message);
            this.retry(5000); // try again after 5 sec
          } else {
            res.send(data);
          }
        });
    }
    if(req.method=='POST') {
        rest.post('https://api.att.com' + req.path, options).on('complete', function(data) {
          if (data instanceof Error) {
            sys.puts('Error: ' + data.message);
            this.retry(5000); // try again after 5 sec
          } else {
            res.send(data);
          }
        });
    }
    if(req.method=='PUT') {
        rest.put('https://api.att.com' + req.path, options).on('complete', function(data) {
          if (data instanceof Error) {
            sys.puts('Error: ' + data.message);
            this.retry(5000); // try again after 5 sec
          } else {
            res.send(data);
          }
        });
    }
});

app.listen(8081);
console.log('Started up successfully.');
