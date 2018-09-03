
var http = require('http'), fs = require("fs");

http.createServer(function(request, response) {

    if(request.url === "/index" || request.url === "/"){
        sendFileContent(response, "public/index.html", "text/html");
    }
    else if(/^\/[a-zA-Z0-9\/]*.js$/.test(request.url.toString())){
        sendFileContent(response, request.url.toString().substring(1), "text/javascript");
    }
    else if(/^\/[a-zA-Z0-9\/]*.css$/.test(request.url.toString())){
        sendFileContent(response, request.url.toString().substring(1), "text/css");
    }
    else if(/^\/[a-zA-Z0-9\/]*.png$/.test(request.url.toString())){
        sendFileContent(response, request.url.toString().substring(1), "img/");
    }
    else{
        sendFileContent(response, "public/"+request.url.toString().substring(1), "text/html");
        console.log("Requested URL is: " + request.url);
    }
}).listen(8080);

function sendFileContent(response, fileName, contentType){
    fs.readFile(fileName, function(err, data){
        if(err){
            response.writeHead(404);
            response.write("Not Found!");
        }
        else{
            response.writeHead(200, {'Content-Type': contentType});
            response.write(data);
        }
        response.end();
    });
}
