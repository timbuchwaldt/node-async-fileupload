var settings = {
  'port': 3000,
  'max-size': 2048, //KB
  'allowed-types':['image/jpeg','image/png','image/gif'] // [] == all
};
////////////////////////////////////////////////////////////////////////////////
var httpStatus = 200;
var express = require('express');
var app = express.createServer();
var formidable = require('formidable');
var util = require('util');
var uuid = require('node-uuid');
app.listen(settings['port']);
var io = require('socket.io').listen(app);
io.set('log level', 1); 
app.set('view options', {
  layout: false
});
app.get('/', function(req, res){
    res.render('index.ejs',{uuid:uuid.v4()});
});
app.post('/upload/:uid',function(req,res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
      if(files.file.size > (settings['max-size']*1024)){
          httpStatus = 413;
      }else if(settings['allowed-types'].length > 0){
        var validType = false;
        for(var i=0;i<settings['allowed-types'].length;i++){
          if(files.file.type == settings['allowed-types'][i])
            validType = true;
        }
        if(!validType){
          httpStatus = 415;
        }
      }      
      res.writeHead(httpStatus, {'content-type': 'text/plain'});
      printError(httpStatus);
      if(httpStatus < 400){
        require('child_process').spawn('cp', ['-r', files.file.path, "./files/"+files.file.name])
      } 
        res.end(util.inspect({fields: fields, files: files}));    
    });
    form.on('progress',function(received,expected){
      io.sockets.emit(req.params.uid, { progress: (received/(expected*1.0))*100 });
    });
    function printError(httpStatus){
      console.log('httpStatus | '+ httpStatus);
      io.sockets.emit(req.params.uid, { httpStatus:httpStatus });
      return false;
    }
})


