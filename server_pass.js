require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const weather=require(__dirname+"/weather.js");
const https=require("https");
const mongoose = require("mongoose");
const { TIMEOUT } = require("dns");
const { setTimeout } = require("timers");
const { format } = require("path");
const session =require("express-session");
const passport=require("passport");
const LocalStrategy=require("passport-local").Strategy;
const passportLocalMongoose=require("passport-local-mongoose");
const app = express();

let items=[];

const saltrounds=10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine","ejs");

app.use(session(
{
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://"+process.env.DBUSERNAME+":"+process.env.DBPASSWD+"@cluster0.uyobi.mongodb.net/"+process.env.DBNAME+"?retryWrites=true&w=majority",{useNewUrlParser:true, useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);
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
            //unique:true
            }
    });    

userSchema.plugin(passportLocalMongoose);
//userSchema.plugin(passportLocalMongoose, {username : "email"});

const Usercollection=new mongoose.model("userdetails",userSchema);
//weather.getweatherimageurl();

passport.use(new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'passwd'
    },Usercollection.authenticate()));
//passport.use(Usercollection.createStrategy());
passport.serializeUser(Usercollection.serializeUser());
passport.deserializeUser(Usercollection.deserializeUser());


app.get("/home",function(request,response)
{
    //response.sendFile(__dirname+"/login.html");
    if(request.isAuthenticated())
    {
        var comment="blank";
        response.render("home");
    }
    else
    {
        var comment="please login using your credentials";
        response.render("login",{htmlcomment: comment});
    }
});
app.post("/logout",function(request,response)
{
    request.logout();
    var comment="blank";
    response.render("login",{htmlcomment: comment});
});
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
                                Usercollection.register({_id:recusercoll.length+1,username:request.body.emailsub,firstname:request.body.firstname,lastname:request.body.lastname,key:getkeynow(),emailreg:"no"},request.body.passwdreenter,function(err,user)
                                {
                                    if(err)
                                    {
                                        console.log(err);
                                        comment="there was an error with our registration system. try again";
                                        response.render("signup",{htmlcomment: comment});
                                    }
                                    else
                                    {
                                            comment="registration complete. login after email verification";
                                            response.render("login",{htmlcomment: comment});
                                    }
                                });
                                
                            }
                            else
                            {
                                //console.log(getkey());
                                Usercollection.register({_id:1,username:request.body.emailsub,firstname:request.body.firstname,lastname:request.body.lastname,key:getkeynow(),emailreg:"no"},request.body.passwdreenter,function(err,user)
                                {
                                    if(err)
                                    {
                                        console.log(err);
                                        comment="there was an error with our registration system. try again";
                                        response.render("signup",{htmlcomment: comment});
                                    }
                                    else
                                    {
                                            comment="registration complete. login after email verification";
                                            response.render("login",{htmlcomment: comment});
                                    }
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
                const tempuser = new Usercollection(
                    {
                        username:request.body.username,
                        password:request.body.passwd
                    });
                    request.login(tempuser,function(err)
                    {
                        if(err)
                        {
                            console.log(err);
                            var comment="there was an error in our authentication system. please try again";
                            response.render("login",{htmlcomment: comment});
                        }
                        else
                        {
                            if(recusercoll.emailreg=="yes")
                            {
                                //console.log("email verification completed");
                                passport.authenticate("local")(request,response,function()
                                {
                                    var comment="blank";
                                    response.render("home");
                                });
                            }
                            else
                            {
                                //console.log("email verification not yet completed");
                                var comment="email verification not yet completed";
                                response.render("login",{htmlcomment: comment});
                            }
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
