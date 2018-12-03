const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const express = require('express');
const app = express();

var server_port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
	server_ip_address = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
	data_dir = process.env.OPENSHIFT_DATA_DIR || __dirname+"/public/cloud"

app.get('/', (req, res) => {
	var date = new Date().toUTCString()
	console.log(req.connection.remoteAddress + " - " + date, "GET", "index.html")
	res.sendFile(__dirname+"/public/index.html")
});

app.get('/cloud/*', (req, res) => {
	var doc = path.basename(req.originalUrl)
	var date = new Date().toUTCString()
	console.log(req.connection.remoteAddress + " - " + date, "GET", doc)
	res.sendFile(data_dir + "/" + doc)
});

app.post('/', (req, res) => {
 	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {
		var date = new Date().toUTCString()
		console.log(req.connection.remoteAddress + " - " + date, "POST", files.current.name)
		var temp = files.current.path;
		var working = data_dir+"/"+files.current.name;
		fs.copyFile(temp, working, function (err) {
			if (err) throw err;
		  res.end();
		}); 
	});
});

app.use('/', express.static('public'));
 
app.listen(server_port, server_ip_address, function () {
	console.log("Server running on " + server_ip_address + ", port " + server_port )
	console.log("OPENSHIFT_DATA_DIR:", data_dir)
});

module.exports = app;
