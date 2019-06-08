var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Article = require('../models/article');
var Notifications = require('../models/notifications');

/* GET users list exept him/herself */
router.get('/', function(req, res) {
    if(req.isAuthenticated()){
        User.find({_id:{$ne:req.user.id}}).exec(function (err,users) {
            if(err){
                next(err);
            }
            res.render('users',{title:'Users',users: users});
        });
    }
    else {
        res.send('You must login first');
    }
});

// User profile page.
router.get('/user/:id',function (req, res, next) {
    // id  of user we are viewing
    User.findById(req.params.id).exec(function (err,user) {
        if(err){
            next(err);
        }
        if(!user){
            res.send('No user found');
        }
        // renders the profile of user itself.
        if(JSON.stringify(req.user.id)===JSON.stringify(req.params.id)){
            res.render('user_detail',{title:'User Detail',user:user,follows:true,myself:true});
        }
        // renders profile of other users
        else {
            // finds whether the current user follows the user we are viewing or not.
            User.find({_id:req.user.id,follows:req.params.id}).exec(function (err,result) {
                if(err){
                    next(err);
                }
                // current user doesn't follows the user we are viewing.
                if(!result.length){
                    // finds whether the request has been send to user we are viewing or not.
                    Notifications.find({From:req.user.id,To:req.params.id}).exec(function (err,result) {
                        if(err){
                            next(err);
                        }
                        // request hasn't been send
                        if(!result.length){
                            res.render('user_detail',{title:'User details',user:user,follows:false,myself:false,reqsend:false});
                        }
                        // request has been send
                        else {
                            res.render('user_detail',{title:'User details',user:user,follows:false,myself:false,reqsend:true});
                        }
                    });
                }
                // current user does follows the user we are viewing
                else {
                    res.render('user_detail',{title:'User details',user:user,follows:true,myself:false,reqsend:true});
                }
            });
        }
    })
});

//user edit form
router.get('/user/:id/edit',function (req, res, next) {
    User.findById(req.params.id).exec(function (err,user) {
        if(err){
            next(err);
        }
        res.render('user_edit',{title:'Update ur info',user:user});
    });

});
// user edit form handler
router.post('/user/:id/edit',function (req, res, next) {

    var new_user = User({
            _id: req.params.id,
            name: req.body.Name,
            email: req.body.E_mail
        }
    );

    User.findByIdAndUpdate(req.params.id,new_user,{}).exec(function (err) {
        if(err){
            next(err);
        }
        res.redirect('/users');
    });
});

// user delete handler
router.post('/user/:id/delete',function (req, res) {

    User.findOne({_id:req.params.id}).exec(function (err,result) {
        if(err){
            next(err);
        }
        result.remove();
        res.redirect('/users');
    });
});

// user's article details
router.get('/user/articles/:id',function (req,res) {
    Article.findById(req.params.id).exec(function (err,article) {
        if(err){
            next(err);
        }
        res.render('article_detail',{title:'Article',article:article});

    })
});

// logout handler for user
router.get('/logout', function(req, res){
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

//user follow accept route
// also deletes corresponding notification
router.post('/accept/:id',function (req,res) {
   //userToFollow = req.user
   // userFollowing = req.params.id
   User.findOneAndUpdate({_id:req.params.id},{$push:{follows:req.user}},{}).then(function (result) {
      User.findOneAndUpdate({_id:req.user._id},{$push:{followed_by:result}},{}).then(function (result) {
         Notifications.find({To:req.user.id}).exec(function (err,result) {
             if(err){
                 next(err);
             }
             result[0].remove();
         });
      });
   });
   res.redirect('/');
});
module.exports = router;