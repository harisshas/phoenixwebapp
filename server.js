require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const weather=require(__dirname+"/weather.js");
const https=require("https");
const mongoose = require("mongoose");
//to use key based encryption
//const encrypt = require("mongoose-encryption");
//to use hashing
//const md5 = require("md5");
const bcrypt=require("bcryptjs");

const { TIMEOUT } = require("dns");
const { setTimeout } = require("timers");
const { format } = require("path");
const app = express();

let items=[];

const saltrounds=10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine","ejs");

mongoose.connect("mongodb+srv://"+process.env.DBUSERNAME+":"+process.env.DBPASSWD+"@cluster0.uyobi.mongodb.net/"+process.env.DBNAME+"?retryWrites=true&w=majority",{useNewUrlParser:true, useUnifiedTopology: true});

function getkeynow()
{
    var key="";
    for(var i=0;i<16;i++)
    {
        var numalph=Math.floor(Math.random()*26);
        //console.log(numalph);
        var num = String.fromCharCode(97 + numalph);
        key+=num;
    }
    return(key);
}

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
        },
        password:{
            type:String,
            required:[true,"password not specified"]
            //unique:true
            }
    });    

//to use encrypt. add key in heroku if required
//userSchema.plugin(encrypt,{secret:process.env.SECRET,encyptedFields:['password'],excludeFromEncryption: ['_id','firstname','lastname','key','emailreg','username']});

const Usercollection=mongoose.model("userdetails",userSchema);
//weather.getweatherimageurl();

app.get("/",function(request,response)
{
    //response.sendFile(__dirname+"/login.html");
    var comment="blank";
    response.render("login",{htmlcomment: comment});

});
app.post("/signup",function(request,response)
{
    var comment="blank";
    response.render("signup",{htmlcomment: comment});
});
app.get("/signup",function(request,response)
{
    var comment="blank";
    response.render("signup",{htmlcomment: comment});
});
app.post("/register",function(request,response)
{
    /*
    console.log("first name:"+request.body.firstname);
    console.log("last name:"+request.body.lastname);
    console.log("email:"+request.body.emailsub);
    console.log("password entered:"+request.body.passwd);
    console.log("password re-entered:"+request.body.passwdreenter);
    console.log("whether subscribed to newletter:"+request.body.subscribe);
    */
    //console.log(request.body);
    
    var comment="There was some issue with your registration. please try again.";
    if(request.body.firstname=="")
    {
        comment="firstname cannot be blank.";
        response.render("signup",{htmlcomment: comment});
    }
    else if(request.body.lastname=="")
    {
        comment="lastname cannot be blank.";
        response.render("signup",{htmlcomment: comment});
    }
    else if(request.body.emailsub=="")
    {
        comment="email cannot be blank.";
        response.render("signup",{htmlcomment: comment});
    }
    else if(request.body.passwd.length<8)
    {
        comment="password should contain atleast 8 letters";
        response.render("signup",{htmlcomment: comment});
    }
    else if(request.body.passwd!==request.body.passwdreenter)
    {
        comment="entered passwords don't match";
        response.render("signup",{htmlcomment: comment});
    }
    else 
    {
        Usercollection.findOne({username:request.body.emailsub},function(err,recusercoll)
        {
            if(err)
            {
                comment="there was an error connecting to database. try again";
                response.render("signup",{htmlcomment: comment});
            }
            else
            {
                if(recusercoll)
                {
                    comment="the email id is already registered";
                    response.render("signup",{htmlcomment: comment});
                }
                else
                {
                    Usercollection.find({},function(err,recusercoll)
                    {
                        if(err)
                        {
                            comment="there was an error connecting to database. try again";
                            response.render("signup",{htmlcomment: comment});
                        }
                        else
                        {
                            if(recusercoll)
                            {
                                //console.log(recusercoll.length);
                                //console.log(getkey());
                                bcrypt.hash(request.body.passwdreenter,saltrounds,function(err,hash)
                                {
                                    const usercoll=new Usercollection(
                                        {
                                            _id:recusercoll.length+1,
                                            username:request.body.emailsub,
                                            firstname:request.body.firstname,
                                            lastname:request.body.lastname,
                                            key:getkeynow(),
                                            emailreg:"no",
                                            password:hash
                                            //to use md5 hasing     
                                            //password:md5(request.body.passwdreenter)
                                        });
                                    usercoll.save();
                                    comment="registration complete. login after email verification";
                                    response.render("login",{htmlcomment: comment});
                                });
                                
                            }
                            else
                            {
                                //console.log(getkey());
                                bcrypt.hash(request.body.passwdreenter,saltrounds,function(err,hash)
                                {
                                    const usercoll=new Usercollection(
                                        {
                                            _id:1,
                                            username:request.body.emailsub,
                                            firstname:request.body.firstname,
                                            lastname:request.body.lastname,
                                            key:getkeynow(),
                                            emailreg:"no",
                                            password:hash
                                            //to use md5 hasing     
                                            //password:md5(request.body.passwdreenter)
                                        });
                                    usercoll.save();
                                    comment="registration complete. login after email verification";
                                    response.render("login",{htmlcomment: comment});
                                });
                            }
                        }
                    });
                }
            }
        });
    }
    //response.render("signup",{htmlcomment: comment});
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
                //to use md5 hashing instead use below code
                //if(recusercoll.password==md5(request.body.passwd))
                bcrypt.compare(request.body.passwd,recusercoll.password,function(err,res)
                {
                    if(res==true)
                    {
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
                });
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
