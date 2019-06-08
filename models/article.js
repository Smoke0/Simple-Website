var mongoose =  require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

//Creates an article schema for user to add articles.
var ArticleSchema = new Schema(
    {
        author:{type:Schema.ObjectId,ref:'User',required:true},
        title : {type: String,required: true},
        text : {type:String},
        creationDate :{type:Date,default:Date.now},
        lastUpdatedOn :{type:Date,default:Date.now}
    }
);

// formats date in suitable form.
ArticleSchema.virtual('creationDateFormatted').get(function () {
        return moment(this.creationDate).format('h:mm:ss a,DD MMM Y');
    });

// formats date in suitable form.
ArticleSchema.virtual('lastUpdatedOnFormatted').get(function () {
        return moment(this.lastUpdatedOn).format('h:mm:ss a,DD MMM Y');
    });

// creates a virtual property of url.
ArticleSchema.virtual('url').get(function () {
    return '/users/user/articles/' + this._id;
});

module.exports = mongoose.model('Article',ArticleSchema);