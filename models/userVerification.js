var mongoose =  require('mongoose');
var Schema = mongoose.Schema;

// user verification schema
var verifySchema = new Schema(
    {
        user:{type:Schema.ObjectId,ref:'User',required:true},
        code:{type:String},
        // expires verification schema after 24hr.
        expire_at:{type:Date,default:Date.now,expires:86400}
    }
);

module.exports = mongoose.model('Verify',verifySchema);