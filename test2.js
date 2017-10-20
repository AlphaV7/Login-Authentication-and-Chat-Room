var express = require('express');
var app = express();
var http = require('http');

var store = "";

app.get('/test',function(req,res){
	console.log(req);
	console.log(res);
});

app.listen(8001 , function(){
	console.log('Server running on port : 8001');
	var url = "http://api.nal.usda.gov/ndb/search/?format=json&q=raw+broccoli&sort=n&max=25&offset=0&api_key=DEMO_KEY";
	var temp = http.get(url , function(res){
		res.on('data' , function(data){
			store = store + data;
		});
		res.on('end',function(){
			//console.log(store);
			store = JSON.parse(store);
			var ndb = store.list.item[0].ndbno;
			url = 'http://api.nal.usda.gov/ndb/V2/reports?ndbno='+ ndb + '&type=f&format=json&api_key=DEMO_KEY';
			var req = http.get(url , function(res){
				store = "";
				res.on('data',function(data){
					store = store + data;
				});
				res.on('end',function(){
					store = JSON.parse(store);
					//console.log(store.foods[0].food.nutrients);
				});
			});
		});	
	});
});