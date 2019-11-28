var express=        require("express");
    app=            express(),
    bodyparser=	    require("body-parser"),
    mongoose=	      require("mongoose"),
    passportlocalmongooose=require('passport-local-mongoose'),
    passport=       require("passport"),
    localstrategy=  require("passport-local"),
    user=           require("./models/user"),
    nodemailer=     require("nodemailer"),
    xoauth2 =       require('xoauth2'),
    request=        require('request');


    /*database connection*/
mongoose.connect('mongodb+srv://sajalagrawal14:1999%40sajal@cluster0-urgf0.mongodb.net/test?retryWrites=true&w=majority', {
	useNewUrlParser: true,
	useCreateIndex: true
}).then(() => {
	console.log('Connected to Mongo DataBase!');
}).catch(err => {
	console.log('ERROR:', err.message);
});
 /*------------------------*/

app.use(express.static(__dirname+"/public"));
app.use(bodyparser.urlencoded({extended : true}));


app.use(require("express-session")({
    secret:"sajal is very good boy",
        saveUninitialized:false,
    resave:false
    }));
    app.use(passport.initialize());
    app.use(passport.session());

/*           Database Schemas            */ 

var visiterSchema=new mongoose.Schema({
	name:String,
	email:String,
	phone:String,
    checkintime : {type:Date,default:Date.now()},
    host:String
});
 var visiter=mongoose.model("visiter",visiterSchema);


 var hostSchema=new mongoose.Schema({
     name:String,
     username:String,
     phone:String,
     email:String,
 })

 var host=mongoose.model("host",hostSchema);


/*---------------------------------------------------*/ 


    passport.serializeUser(user.serializeUser());
    passport.deserializeUser(user.deserializeUser());
    passport.use(new localstrategy(user.authenticate()));

    app.use(function(req,res,next){
        res.locals.currentuser=req.user;
        next();
        });

     
app.get("/",function(req,res){
    res.render("landingpage.ejs");
  
});

app.get("/checkin",function(req,res){
    res.render("checkin.ejs",{msg:""});
    });
    
app.post("/checkin",function(req,res){
    var newvisiter={name:req.body.name,email:req.body.email,contact:req.body.email,host:req.body.host,phone:req.body.phone};
    
    /* finding host details*/ 
    var userhost=req.body.host;
    userhost=userhost.toLowerCase();
    host.findOne({name:userhost }, function(e,user){
        if(e){
            console.log(err);
            res.render("checkin.ejs",{msg:"Requested Host Not Found"});
        }

       if(user===null){ res.render("checkin.ejs",{msg:"Requested Host Not Found"});
    }
    else{

        /*send sms to host informing about guest */
    var tim=new Date();
    tim=tim.toLocaleTimeString('en-US');
    var msg=`${req.body.name.toUpperCase()}|${req.body.email}|${req.body.phone}|${tim}`;
    var fullmsg="https://www.fast2sms.com/dev/bulk?authorization=ejdkgTpc0ZuCsH5vL7OFSRwPyaG6UMQtWlYhnIXmqoA9f2xJb8LrCxtquT71KJegEi2NYVvcbRnkSowh&sender_id=FSTSMS&language=english&route=qt&numbers="+user.phone+"&message=19086&variables={DD}|{EE}|{CC}|{FF}&variables_values="+encodeURIComponent(msg);

request.get(fullmsg,function(err,body){
 if(err){
     console.log("err in sending msg ");
 }
 else{

    console.log("sms send to guest");
 }
});

/*----------------------------------------*/

        
        var hostemail=user.email;
     /*-------------------------------*/ 
     
       visiter.create(newvisiter,function(err,person){
		  if(err){
			  console.log(err);
	      res.render("/");
		  }   
		 else{

                      /* find the email id of host from host database accouding to name provided by Guest */ 

          /* mail to Host */
          /*--------------------------------------*/
          const output=`
          <p>You have a New Guest waiting for you</p>
          <h3>Contact Details</h3>
          <ul><li>Name: ${req.body.name.toUpperCase()}</li>
          <li>Email:  ${req.body.email}</li>
          <li>Phone:  ${req.body.phone}</li>
          <li>Check in time:  ${person.checkintime.toLocaleTimeString('en-US')}</li>
          </ul>
          <p>Please Call him</p>
          `;

          const transporter = nodemailer.createTransport({
                service: 'gmail',   
                secure: false,
                host: 'smtp.gmail.com', 
                port: 587,
                auth: {
                  type: 'OAuth2',
                  user: 'summergeek14@gmail.com',
                  pass:"summer@Geek14",
                  clientId: '614930322271-5fkp5471d25qgf465mt8ji91oi36utfk.apps.googleusercontent.com',
                  clientSecret: 'kTKckJqccfCerSF9Tf3oVjR8',
                  refreshToken: '1//04AgXE7CseTgHCgYIARAAGAQSNwF-L9IrbmtMxRJSvYokUR_YEg1Kx4WfetXtKzcC0H5F0ZscIvsq4-yKJ_lFD1u2Lk6u_kBKdNk',
              },
            });

          var mailOptions = {
                from: 'SummerGeek <noreply.summergeek14@gmail.com>',
                to: hostemail,
                subject: 'Someone Waiting For you',
                replyTo: 'noreply.summergeek14@gmail.com',
                text: "hello world",
                html: output
          }

          transporter.sendMail(mailOptions, function (err, res) {
                if(err){
                    console.log(err);
                } else {
                    console.log('Email Sent to guest');
                }
          });
          /*--------------------------------------*/ 

                  }

    
});



res.render("checkin.ejs",{msg:"Request Send"});
}});

});
/*-------------------------------------------------------*/
     


/*              CHECKOUT ROUTE                */ 
app.get("/checkout",function(req,res){
    visiter.find({},function(err,visiter){
		if(err){
            console.log(err);
            res.redirect("/");
		}
		else{
			res.render("checkout.ejs",{visiter:visiter});
		}
	})
});

/*-------------------------------------------------------*/



/*checkout remove route */ 
app.get("/checkout/:id",function(req,res){


    var id=req.params.id;
/*send email to Guest Abouts it own full application*/
    visiter.findById(id,function(err,guest){
            if(err){
                console.log(err);
                res.redirect("/");
            }
            else{

                var tim=new Date();
                tim=tim.toLocaleTimeString('en-US');
                var msg=`${guest.name.toUpperCase()}|${guest.checkintime}|${tim}|${guest.host.toUpperCase()}|SummerGeek , Patna ,Bihar`;
                var fullmsg="https://www.fast2sms.com/dev/bulk?authorization=ejdkgTpc0ZuCsH5vL7OFSRwPyaG6UMQtWlYhnIXmqoA9f2xJb8LrCxtquT71KJegEi2NYVvcbRnkSowh&sender_id=FSTSMS&language=english&route=qt&numbers="+guest.phone+"&message=19085&variables={CC}|{BB}|{DD}|{FF}|{EE}&variables_values="+encodeURIComponent(msg);

                request.get(fullmsg,function(err,body){ 
                if(err){
                  console.log("err in sending msg ");
                }
                else{

                  console.log("sms send to guest");
                }
                });



                  var dd=new Date();
                  /* mail to guest */
                  /*--------------------------------------*/
                  const output=`
                  <p>Details About your Todays Visit At summergeek </p>
                  <ul><li>Name: ${guest.name.toUpperCase()}</li>
                  <li>Phone:  ${guest.phone}</li>
                  <li>Check in time:  ${guest.checkintime.toLocaleTimeString('en-US')}</li>
                  <li>Check Out time:  ${dd.toLocaleTimeString('en-US')}</li>
                  <li>Host Name:  ${guest.host.toUpperCase()}</li>
                  <li>Address Visited: SummerGeek Center , Nit Patna , Patna  , Bihar</li>

                  </ul>
                  <p>Thanks For your Visit</p>
                  `;

                  const transporter = nodemailer.createTransport({
                      service: 'gmail',   
                      secure: false,
                      host: 'smtp.gmail.com', 
                      port: 587,
                      auth: {
                        type: 'OAuth2',
                        user: 'summergeek14@gmail.com',
                        pass:"summer@Geek14",
                        clientId: '614930322271-5fkp5471d25qgf465mt8ji91oi36utfk.apps.googleusercontent.com',
                        clientSecret: 'kTKckJqccfCerSF9Tf3oVjR8',
                        refreshToken: '1//04AgXE7CseTgHCgYIARAAGAQSNwF-L9IrbmtMxRJSvYokUR_YEg1Kx4WfetXtKzcC0H5F0ZscIvsq4-yKJ_lFD1u2Lk6u_kBKdNk',
                      },
                    });

                  var mailOptions = {
                      from: 'SummerGeek <noreply.summergeek14@gmail.com>',
                      to: guest.email,
                      subject: 'Visiting Details',
                      replyTo: 'noreply.summergeek14@gmail.com',
                      text: "hello world",
                      html: output
                  }

                  transporter.sendMail(mailOptions, function (err, res) {
                      if(err){
                          console.log(err);
                      } else {
                          console.log('Email Sent to Guest');
                      }
                  });
                  /*--------------------------------------*/ 




                  }


});



/*-----------------------------------------*/

/*removing the guest */
visiter.findByIdAndRemove(req.params.id,function(err){
    if(err){
        res.send("there is error in deleting the Visiter");
        res.redirect("/");
    }
    else{
        res.redirect("/checkout");
    }
});

});


/*--------------------------------------*/ 



/*Login route*/
app.get("/login",function(req,res){
  res.render("login.ejs");
});
/*--------------------------------------*/ 


/*Login postroute*/

app.post("/login",passport.authenticate("local",{
	successRedirect:"/",
	failureRedirect:"/login",	
	failureFlash:false
//	successFlash:""
}),function(req,res){
});
/*--------------------------------------*/


/*signup get route*/

app.get("/signup",function(req,res){

       res.render("signup.ejs");
    });
/*--------------------------------------*/


/*signup post route*/

app.post("/signup",function(req,res){
var name=req.body.name;
name=name.toLowerCase();
var email=req.body.email;
var phone=req.body.phone;
var username=req.body.username;
var password=req.body.password;
user.register(new user({username:req.body.username}), req.body.password , function(err,user){
    if(err){
        console.log(err);
        res.redirect("/signup");
    }
    else{
        passport.authenticate("local")(req,res,function(){
            console.log("congrats user registeres "+user);
            host.create({name:name,email:email,phone:phone,username:username},function(err,guest){
                if(err){
                    console.log("/error");
                    res.redirect("/signup");
                }
                else{
                    console.log(username+" "+password);
                    res.redirect("/");    
                
                }
                   });    
        })
    
    
    
    }
    });

    });

/*--------------------------------------*/


/*host detail route*/
app.get("/host",function(req,res){
        host.find({},function(err,visiter){
            if(err){
                console.log(err);
                res.redirect("/");
            }
            else{
                res.render("hosts.ejs",{host:visiter});    }
        })
        
    });
/*--------------------------------------*/ 

/*log out route*/ 
app.get("/logout",function(req,res){
      req.logout();
      res.redirect("/");
});
    
/*--------------------------------------*/
    
const port = process.env.PORT || 5000
      app.listen(port,function(){
      console.log("Server is started");
});