var express = require('express');
var router = express.Router();
var uuid = require('uuid');
var passport = require('passport');

var User = require('../models/User');
var userVerify  = require('../models/userVerification');
var Notification = require('../models/notifications');
var Article = new require('../models/article');

var emailer = require('../email');
const { body,validationResult } = require('express-validator/check');


/* GET home page. */
router.get('/', function(req, res) {
    // renders page based on whether user is logged in or not.
  res.render('index', { title: 'Legendary',formdata:{},Login:req.isAuthenticated(),user:req.user,err:[]});
});

//POST handler for home page
router.post('/',[
    body('E_mail','Invalid Email format.').exists().isEmail().normalizeEmail().custom(function(E_mail){
      return User.findOne({email:E_mail}).then(function(user){
        if (user){
          return Promise.reject('Email already in use');
        }
      })
    }),
    body('password','Password should have atleast one upper one lower one numeric and one special charater.').exists().matches("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"),

  function (req,res,next) {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      res.render('index',{title:'Legendary',formdata:req.body,Login:req.isAuthenticated(),user:req.user,err:errors.array()});
    }
    else{
      // creates a new user doc.
    var user = new User({
        name: req.body.Name,
        email:req.body.E_mail,
        password:req.body.password,
        active:false
    });
    // save has 3 argument in cb fun
    user.save(function (err,saved_doc,no_rows_affected) {
        if(err){
            next(err);
        }
    });
    // creates a user verify code
    var token = uuid();
    var verify = new userVerify({
        user:user,
        code:token
    });
    verify.save(function (err) {
        if(err){
            next(err);
        }
    });
    // sends a mail to user having verify code.
    var string = 'Hi! Your verification code is ' + token;
    //emailer(user.name,user.email,string);
    res.redirect("/");
    }
    
}]);

// Creates an user article
router.get('/createarticle',function (req,res) {
    res.render('create_article');
});

//post handler for user article
router.post('/createarticle',function (req,res) {
    // creates a article doc
    var article = new Article(
        {
            title : req.body.title,
            text :req.body.text,
            author : req.user,
        }
    );
    // saves a article doc
    article.save(function (err) {
        if(err){
            next(err);
        }
        res.redirect('/');
    })
});
// get contact route
router.get('/contact',function (req,res) {
    res.render('contact',{title:'Email Us'})
});
// post handler for  contact route
router.post('/contact',function (req,res) {
    emailer(req.body.Name,req.body.E_mail,req.body.text);
    res.redirect('/contact');
});


// Lists user articles.
router.get('/articles/article',function (req,res) {
    Article.find({'author':req.user}).exec(function (err,result) {
        if(err){
            next(err);
        }
        if(!result.length){
            res.render('articles',{title:'Your have no articles',articles:result});
        }
        else {
            res.render('articles',{title:'Your articles are:',articles:result});
        }
    })
});
// lists article of user of specific ID
router.get('/articles/article/:id',function (req,res,next) {
    User.findById(req.params.id).exec(function (err,user) {
        if(err){
            next(err);
        }
        else {
            Article.find({'author':user}).exec(function (err,articles) {
                if(err){
                    next(err);
                }
                if(!articles.length){
                        res.render('articles',{title:'Users have no articles :',articles:articles});
                }
                else {
                    res.render('articles',{title:'Users articles are:',articles:articles});
                }
            });
        }
    });

});
// Account verification GET route
router.get('/verify/:id',function (req,res) {
    User.findById(req.params.id).exec(function (err,user) {
        if(err){
            next(err);
        }
        else {
            userVerify.findOne({user:user}).exec(function (err,result) {
                if(err){
                    next(err);
                }
                if(!result){
                    res.render('verify',{title:'Your Verification code is expired',user:user,exp:0});
                }
                else {
                    res.render('verify',{title:"Account Verification",user:user,exp:1});
                }
            });
        }

    });
});
// Account verification POST route
router.post('/verify/:id',function (req,res) {
   userVerify.findOne({code:req.body.Code}).exec(function (err,verifiedUser) {
       if(err){
           next(err);
       }
       if(!verifiedUser){
           res.send('Wrong Verification code');
       }
       else {
           User.findByIdAndUpdate(req.params.id,{$set:{active:true}},{}).exec(function(err){
               if(err){
                   next(err);
               }
               res.redirect('/login');
               userVerify.findOneAndRemove({code:req.body.Code}).exec(function (err) {
                   if(err){
                       console.log(err);
                   }
                });
           });

       }
    });
});
// route to resend verification code.
router.post('/verify/resend/:id',function (req,res) {
   User.findById(req.params.id).exec(function (err,user) {
       if(err){
           next(err);
       }
       else {
           var token = uuid();
           var verify = new userVerify({user:user,code:token});
           verify.save(function (err) {
               if(err){
                   next(err);
               }
           });
           var string = 'Hi! Your verification code is ' + token;
           //emailer(user.name,user.email,string);

       }
       res.redirect("/login");
   });
});
// Login get route
router.get('/login',function (req,res) {
    res.render('log_in',{title:'Login'})
});
// login post route
router.post('/login',function (req,res,next) {
    passport.authenticate('local',function(err,user,info){
        if(info){
            return res.send(info.message)
        }
        if(err){
            return next(err);
        }
        if(!user){
            return res.redirect('/login');
        }
        else {
            if(!user.active){
                return res.redirect('/verify/'+user._id)
                }
            else {
                req.login(user,function(err){
                    if(err){next(err)}
                    return res.redirect('/');
                })
            }
        }
    })(req,res);
    /*User.findOne({email:req.body.E_mail}).then(function (user) {
        if(user){
            bcrypt.compare(req.body.password,user.password,function (err,result) {
                if(result){
                    console.log(req.session);
                    req.session.regenerate(function () {
                        res.redirect('/');
                        console.log(req.session.result);
                    })

                }
                else {
                    res.render('log_in',{title:'Wrong password try again'})
                }
            })
        }
        else {
            res.render('log_in',{title:'No Users found try again'})
        }
    })*/
    //console.log('Inside POST /login callback');
});
module.exports = router;