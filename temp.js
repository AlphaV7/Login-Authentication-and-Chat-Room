var http = require('http');


var requestHandler = (request, response) => {
  console.log(request.url)
  response.end('Hello Node.js Server!')
}

var server = http.createServer(requestHandler)
var final = "" , final2 = "";
server.listen(8001, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  var url = 'http://api.nal.usda.gov/ndb/search/?format=json&q=raw+mango&sort=n&max=25&offset=0&api_key=DEMO_KEY '
  var req = http.get(url, function(res) {
  		res.setEncoding('utf8');
  		res.on('data', function (data) {
  			final = final + data;
  		});
  		res.on('end', function(){
  			//console.log(final);
        	var fb = JSON.parse(final);
        	console.log(fb.list.item[0].ndbno);
        	var ndb = fb.list.item[0].ndbno;
        	var url2 = "http://api.nal.usda.gov/ndb/V2/reports?ndbno="+ndb+"&type=b&format=json&api_key=DEMO_KEY";
        				//htts://api.nal.usda.gov/ndb/V2/reports?ndbno=09176&type=f&format=json&api_key=DEMO_KEY
        	console.log(url2);
        	var req2 = http.get(url2,function(res2){
        		res2.setEncoding('utf8');
        		res2.on('data',function(data2){
        			final2 = final2 + data2;
        		});
        		res2.on('end',function(){
        			var fb2 = JSON.parse(final2);
        			console.log(fb2.foods[0].food.nutrients[2].value);
        		});
        	});
        	//console.log("Got a response: ", fbResponse.list.q);
    	});
  });
  console.log('server is listening on 8001')
})