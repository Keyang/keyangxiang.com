/**
 * Module dependencies.
 */

var express = require('express'), format = require('util').format;
var csv = require("csv");
var fs = require("fs");

process.env.TMP = process.env.TMP || process.env.HOME + "/app"
// bodyParser in connect 2.x uses node-formidable to parse
// the multipart form data.

var app = module.exports = express.createServer();
app.use(express.bodyParser());

app.get('/', function(req, res) {
	fs.readFile("./index.html", function(err, data) {
		res.write(data);
		res.end();
	})
});
app.get('/nonajax', function(req, res) {
	res.send('<form method="post" enctype="multipart/form-data" action="/upload">' + '<p>CSV: <input type="file" name="csv" /></p>' + '<p><input type="submit" value="Upload" /></p>' + '</form>');
});
app.get('/ns', function(req, res) {
	res.send('<form method="post" action="/upload1">' + '<input type="hidden" id="loader" value="/upload1"/>' + '<p>CSV: <textarea id="rawcsv" name="rawcsv"></textarea></p>' + '<p><input type="submit" value="Upload" /></p>' + '</form>');
});
app.get('/lib.js', function(req, res) {
	fs.readFile("./ajaxfileupload.js", function(err, data) {
		res.write(data);
		fs.readFile("./loade.js", function(err, data) {
			res.write(data);
			res.end();
		});
	});
});
app.post('/upload1', function(req, res, next) {
	var arr = [];
	var csvdata = req.body.rawcsv;
	var path = "tmp.txt";
	fs.writeFileSync(path, csvdata);

	csv().fromPath(path).on("data", function(data, index) {
		arr.push(data);
	}).on("end", function() {
		res.contentType("json/text");
		res.write(JSON.stringify(arr));
		res.end();
	});
});
function parser(key,data,res) {
	var _parsers = {
		arr : function(key, data, res) {
			key=key.replace("[]","");
			if(res[key] == undefined) {
				res[key] = [];
			}
			
			res[key].push(data);
			return res;
		},
		json : function(key, data, res) {
			var keyArr = key.split(".");
			var keyStr = keyArr.shift();

			if(res[keyStr] == undefined) {
				res[keyStr]={};
			}
			if (keyArr.length>0){
				var restKey = keyArr.join(".");
				res[keyStr]= parser(restKey,data,res[keyStr]);
			}else{
				res[keyStr]=data;
				
			}
			return res;
			
		},
		text:function(key,data,res){
			 res[key]=data;
			 return res;
		}
	}
	var regex={
		arr:/.+\[\]/,
		json:/(.*\..+)+/,
		omit:/\*omit\*/
	}
	
	if (regex.omit.test(key)===true){
		return false;
	}else if (regex.json.test(key)===true){
		return _parsers.json(key,data,res);
	}else if (regex.arr.test(key)===true){
		return _parsers.arr(key,data,res);
	}else{
		return _parsers.text(key,data,res);
	}
	
}


app.post('/api', function(req, res, next) {
	
	var arr = [];
	var csvdata = req.body.csv;
	var omit = "," + req.body.omit + ",";
	var path = "tmp.txt";
	var row1 = true;
	var headRule=[];
	fs.writeFileSync(path, csvdata);

	csv().fromPath(path).on("data", function(data, index) {
		if(row1 === true) {
			row1 = false;
			headRule=data;
			return;
		}
		var rtn = {};
		for(var i = 0; i < data.length; i++) {
			if(omit.indexOf("," + i + ",") == -1) {
				var key=headRule[i];
				var d=data[i];
				var rrtn=parser(key,d,rtn);
				if (rrtn!=false){
					rtn=rrtn;
				}
			}
		}
		arr.push(rtn);
	}).on("end", function() {
		//res.contentType("json/text");
		//var rtnStr="["+arr.join(",")+"]";
		var rtnStr=JSON.stringify(arr);
		res.send(rtnStr);
		res.end();
	});
});

app.get("/env", function(req, res) {
	res.write(JSON.stringify(process.env));
	res.end();
});

app.get("/write", function(req, res) {
	var test = "text";
	var r = (function() {
		var dirs = [process.env.TMP, '/tmp', process.cwd()];
		for(var i = 0; i < dirs.length; i++) {
			var dir = dirs[i];
			var isDirectory = false;

			try {
				isDirectory = fs.statSync(dir).isDirectory();
			} catch (e) {
			}

			if(isDirectory)
				return dir;
		}
	})()
	fs.writeFile(r + "/test.txt", test, function() {

	});
	//res.write(JSON.stringify(process.env));
	res.end();
});
app.get("/test", function(req, res) {
	var r = (function() {
		var dirs = [process.env.TMP, '/tmp', process.cwd()];
		for(var i = 0; i < dirs.length; i++) {
			var dir = dirs[i];
			var isDirectory = false;

			try {
				isDirectory = fs.statSync(dir).isDirectory();
			} catch (e) {
			}

			if(isDirectory)
				return dir;
		}
	})()
	res.write(r);
	//res.write(JSON.stringify(process.env));
	res.end();
});

app.listen(process.env.VCAP_APP_PORT || 3000);
