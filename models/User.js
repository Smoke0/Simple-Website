var mongoose =  require('mongoose');
var bcrypt = require('bcrypt');
var Article = require('./article');

var Schema = mongoose.Schema;

// Creates a user schema.
var UserSchema = new Schema(
    {
        name : {type: String,required: true},
        email : {type: String,required: true,unique:true},
        password : {type: String,required:true},
        active: {type:Boolean},
        // both are implementations are different
        //follows: [this],
        //followed_by:[this]
        // creates an array of object Ids of User Schema.
        follows: [{type:Schema.ObjectId,ref:'UserSchema',default:[]}],
        followed_by: [{type:Schema.ObjectId,ref:'UserSchema',default:[]}]
    }
);

// adding pre hook to hash pass before saving
UserSchema.pre('save',function (next) {
    var user = this;
    bcrypt.hash(user.password,10,function (err,hash) {
        if(err){
            return next(err);
        }
        user.password = hash;
        // This next calls the next middleware without it next middleware wont be called.
        next();
    });

});
// This remove middleware is wierd one.
// Here if you use pre hook on remove it won't work.
// If you directly remove User like User.remove it wont work
// You first have to find it like User.findOne and then remove it using User.remove
UserSchema.pre('remove',function (next) {
    Article.remove({author:this}).exec(function (err) {
        if(err){console.log(err)}
    });
    next();
});

// Creates a virtual field of article url.
UserSchema.virtual('url').get(function () {
        return '/users/user/' + this._id;
    });
module.exports = mongoose.model('User',UserSchema);