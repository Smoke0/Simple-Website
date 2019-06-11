var express = require('express');
var router = express.Router();

var Notification = require('../models/notifications');
var User = require('../models/User');

// Lists user
router.get('/',function (req,res) {
    Notification.find({To:req.user}).exec(function (err,result) {
        if(err){
            next(err);
        }
        if(!result.length){
            res.render('./notification/myNotifications',{title:'Your have no notifications',notifications:result});
        }
        else {
            res.render('./notification/myNotifications',{title:'Your Notifications are:',notifications:result});
        }
    });
});

// to send a request to follow a user.
router.post('/users/user/:id/follow',function (req,res) {
    // userToFollow = req.params.id
    // userFollowing = req.user
    User.findOne({_id:req.params.id}).exec(function (err,user) {
        if(err){
            next(err);
        }
        else {
            var link = [];
            link.push('/users/accept/' + req.user._id);
            var notfic = new Notification(
                {
                    Text:'You got Follow request',
                    To: user,
                    From:req.user,
                    Links: link
                }
            );
            notfic.save();
        }
        req.flash('success','Follow request send.');
        res.redirect('/users');
    });
});

// to unfollow a user.
router.post('/users/user/:id/unfollow',function (req,res) {
    // userToUnFollow = req.params.id
    // userUnFollowing = req.user
    User.findOneAndUpdate({_id:req.user.id},{$pullAll:{follows:[req.params.id]}},{}).exec(function (err) {
        if(err){
            next(err);
        }
    });
    User.findOneAndUpdate({_id:req.params.id},{$pullAll:{followed_by:[req.user.id]}},{}).exec(function (err) {
        if(err){
            next(err);
        }
    });
    req.flash('success','Unfollowed the User');
    res.redirect('/users');

});
module.exports = router;