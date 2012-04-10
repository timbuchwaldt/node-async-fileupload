var express = require('express');
var app = express.createServer();
var formidable = require('formidable');
var util = require('util');
var uuid = require('node-uuid');
app.listen(3000);
var io = require('socket.io').listen(app);
app.set('view options', {
  layout: false
});

app.get('/', function(req, res){
    res.render('index.ejs',{uuid:uuid.v4()});
});
app.post('/upload/:uid',function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      require('child_process').spawn('cp', ['-r', files.file.path, "./files/"+files.file.name])
      res.end(util.inspect({fields: fields, files: files}));
    });
    form.on('progress',function(received,expected){
    	io.sockets.emit(req.params.uid, { progress: (received/(expected*1.0))*100 });

    	console.log(received+"/"+expected)
    })
})


