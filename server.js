const express = require("express");
const bodyParser = require("body-parser");
const https=require("https");
const { TIMEOUT } = require("dns");
const { setTimeout } = require("timers");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/",function(request,response)
{
    response.sendFile(__dirname+"/login.html");
});
app.post("/signup",function(request,response)
{
    response.sendFile(__dirname+"/signup.html");
});
app.post("/",function(request,response)
{
    if(request.body.username=="harissh.a.s@gmail.com" && request.body.passwd=="123")
    {
        response.sendFile(__dirname+"/home.html");
    }
    else
    {
        const url="https://api.openweathermap.org/data/2.5/weather?lat=10.809&lon=78.6988&appid=59df6b279dbca9946fc700568bb0b6f3&units=metric";
        https.get(url,function(resp)
        {
            //console.log("response code is:"+resp.statusCode);
            resp.on("data",function(data)
            {
                var imageurl="http://openweathermap.org/img/wn/"+JSON.parse(data).weather[0].icon+"@2x.png"
                console.log(imageurl);
                response.send("<img src="+imageurl+"></img>");
                //console.log(JSON.parse(data).main.temp);              
            });
        });
        
        //response.send("username or password incorrect")
    }
});
app.listen(process.env.PORT || 3000,function()
{
    console.log("server running at port 3000");
});
