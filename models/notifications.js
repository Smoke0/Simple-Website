var mongoose =  require('mongoose');
var Schema = mongoose.Schema;

// Creates a Notification Schema.
var NotificationSchema = new Schema(
    {
     Text:{type:String,required:true},
     From:{type:Schema.ObjectId,ref:'User'},
     Seen:{type:Boolean,default:false},
     expire_at:{type:Date,expires:300},
     // for future
     //To:[{type:Schema.ObjectId,ref:'User'}]
     To:{type:Schema.ObjectId,ref:'User',required:true},
     Links:[{type:String}]
    }
);

// this one sets expire time on notification if it has been seen.
// as update in mongoose happens using query not using doc
// so 'this' here refers to query object not doc.
// query has _update field which will be updated after finishing query.
NotificationSchema.pre('findOneAndUpdate',function (next) {
   if (this._update.$set.Seen){
       // the line below adds expire_at in query and document gets updated
       this._update.$set.expire_at = Date.now();
   }
   // Don't ignore next it's very very very very important
   next();
});
module.exports = mongoose.model('Notification',NotificationSchema);