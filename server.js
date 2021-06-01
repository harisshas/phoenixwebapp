const express = require("express");
const bodyParser = require("body-parser");
const weather=require(__dirname+"/weather.js");
const https=require("https");
const mongoose = require("mongoose");

const { TIMEOUT } = require("dns");
const { setTimeout } = require("timers");
const app = express();

let items=[];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine","ejs");

mongoose.connect("mongodb+srv://dbadmin:dbadmin@2403@cluster0.uyobi.mongodb.net/users?retryWrites=true&w=majority",{useNewUrlParser:true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema(
    {
        _id:{
           type:Number,
           //unique:true
            },
        username:{
            type:String,
            required:[true,"username not specified"],
            unique:true
            },
        password:{
            type:String,
            required:[true,"password not specified"]
            //unique:true
            },
        firstname:{
            type:String,
            required:[true,"firstname not specified"]
            //unique:true
            },
        lastname:{
            type:String,
            required:[true,"lastname not specified"]
            //unique:true
            },
        key:{
            type:String    
        },
        emailreg:{
            type:String
        }
    });    

const Usercollection=mongoose.model("userdetails",userSchema);
//weather.getweatherimageurl();

/*
const usercoll=new Usercollection(
    {
        _id:2,
        username:"arjun_s@gmail.com",
        password:"password3215",
        firstname:"Arjun",
        lastname:"Sridhar",
        key:"fsdafsdkfjsjfoqyeweq",
        emailreg:"no"
    });
usercoll.save();
*/

app.get("/",function(request,response)
{
    //response.sendFile(__dirname+"/login.html");
    var comment="blank";
    response.render("login",{htmlcomment: comment});

});
app.post("/signup",function(request,response)
{
    response.sendFile(__dirname+"/signup.html");
});
app.post("/additenary",function(request,response)
{
    //console.log(request.body.lastitem);
    var lastrecieved=request.body.lastitem;
    if(lastrecieved!="")
    {
        items.push(lastrecieved);
    }
    response.render("itenary",{lastaddeditem: items});
});
app.post("/",function(request,response)
{
    Usercollection.findOne({username:request.body.username},function(err,recusercoll)
    {
        if(err)
        {
            //console.log("error in retrieving from database");
            var comment="error in retrieving from database";
            response.render("login",{htmlcomment: comment});
        }
        else
        {
            if(recusercoll)
            {
                if(recusercoll.password==request.body.passwd)
                {
                    //console.log("username and password match");
                    if(recusercoll.emailreg=="yes")
                    {
                        //console.log("email verification completed");
                        response.render("itenary",{lastaddeditem: items});
                    }
                    else
                    {
                        //console.log("email verification not yet completed");
                        var comment="email verification not yet completed";
                        response.render("login",{htmlcomment: comment});
                    }
                }
                else
                {
                    //console.log("username and password entered do not match");
                    var comment="username and password entered do not match";
                    response.render("login",{htmlcomment: comment});
                }
            }
            else
            {
                //console.log("username not found");
                var comment="username not found";
                response.render("login",{htmlcomment: comment});
            }
            
        }
    });
});
app.listen(process.env.PORT || 3000,function()
{
    console.log("server running at port 3000");
});
