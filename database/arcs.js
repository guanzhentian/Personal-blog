var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/arcs');

/*db.on('error',console.error.bind(console, 'connection error'));
db.once('open',function(callback){console.log("数据库启动");});*/

var Schema = mongoose.Schema;
var arcSchema = new Schema({
	url:String,
	title:String,
	time:String,
	content:String,
	read:Number,
	leibie:String,
	comment:{
		number:Number,
		content:Array
	} //Object
});

var logSchema = new Schema({
	time:String,
	content:String
});

exports.arcs = db.model('arcs',arcSchema);
exports.Log = db.model('Log',logSchema);
