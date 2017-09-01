var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var getNumber = require('./lib/getNumber.js');
var credentials = require('./credential.js');
var checkLogin = require('./lib/checkLogin');
var fs = require('fs');
var arcs = require('./database/arcs.js').arcs;
var Log = require('./database/arcs.js').Log;
var handlebars = require('express3-handlebars').create({
	defaultLayout:'main',
	helpers:{
		section:function(name,options){
			if(!this._sections)this._sections = {};
			this._sections[name] = options.fn(this);
			return null;
		}
	}
});
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');
app.set('port',process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));
app.disable('x-powered-by');

app.use(cookieParser(credentials.cookieSecret));
app.use(require('express-session')());
app.use(bodyParser());
app.use(function(req,res,next){
	res.locals.showTests = app.get('env') !== 'production' && req.query.test ==='1';
	next();
});
/*arcs.remove({},function(){
	console.log("清楚数据成功");
});*/
app.post("/quit",function(req,res){
	if(req.session.login){
		delete req.session.login;
		var time = new Date();
		var log = new Log({
			time:time.toLocaleString().split("GMT")[0],
			content:"注销"
		});
		log.save(function(err,that){
			if(err) 
			{
				console.error(err);
			}else{
				console.log('保存log数据');
				console.log(that);			
			}
		});
		res.redirect(303,"/");
	}else{
		res.status(500);
		res.redirect(303,"500");
	}
});

app.use(function(req,res,next){
	if(req.session.flash)
	{
		res.locals.flash = req.session.flash;
		delete req.session.flash;
	}
	if(req.session.login)
	{	
		if(!res.locals.login)
			res.locals.login = req.session.login;
	}
	next();
});


app.get('/',function(req,res){
	res.render("index");
});
app.get('/arc',function(req,res){
	 res.render('arc');
});
app.post('/arc',function(req,res){
	arcs.find(function(err,arcslist){
			if(err) 
				console.error(err);
			else
				res.send(arcslist);
		});
});
app.get('/about',function(req,res){
	res.render('about',{
		pageTestScript:'/qa/test-about.js',
		currency:{
			name:'this is currency.name',
			abbrev:'USD',
		},
		tours:[
			{name:'Hood River',price:'$99.95'},
			{name:'Oregan Coast',price:'$159.95'}
		],
		specialsUrl:'/specials',
		currencies:['USD','GBP','BTC'],
	});
});

app.get('/login',function(req,res){
	res.render('login');
});
app.post('/login',function(req,res){
	name = req.body.name;
	pas = req.body.password;
	if(name === "guanzhentian" && pas === "guanzhentian")
	{
		var time = new Date();
		var log = new Log({
			time:time.toLocaleString().split("GMT")[0],
			content:"登录"
		});
		log.save(function(err,that){
			if(err) 
			{
				console.error(err);
			}else{
				console.log('保存log数据');
				console.log(that);			
			}
		});
	}
	checkLogin(req,res);
});

app.get('/index',function(req,res){
	res.render('index');
});

app.get('/back',function(req,res){
	if(req.session.login)
	{
		if(fs.existsSync('saveArc.json'))
			fs.readFile('saveArc.json', function(err,data){
				if(err){
					res.status(417).send(err);
					console.log("读取失败！");
				}
				if(data){
					console.log("读取到的数据："+data);
					var saveData = JSON.parse(data);
					res.render('back',{"saveData":saveData});
				}else{
					res.render('back');
				}
				
			});
		else res.render('back');
	}		
	else{
			req.session.flash = {
				type:"danger",
				intro:"权限不足",
				message:" 请登录",			
			};
			res.redirect(303,'/arc');
		}
});

app.post('/back',function(req,res){
	if(!fs.existsSync('./views/arc/'+req.body.url+'.handlebars'))
	{
		fs.writeFile('./views/arc/'+req.body.url+'.handlebars',req.body.data,function(err){
			if(err)
			{
				console.log("写入失败");
				res.status(417).send(err);
				return console.error(err);
			}
			console.log('写入文件成功');
			console.log('-------------');
	
			
			if(fs.existsSync('saveArc.json'))
				fs.unlink('saveArc.json', function(err) {
		  			console.log("准备删除文件！");
		  			if(err){
		     			return console.error(err);
		  			}
					console.log("文件删除成功！");
				});
			console.log('准备保存数据');
			console.log('------------');
			var comment = {
				number:0,
				content:[]
			};
			var time =new Date();
			var arc = new arcs({
				url:req.body.url,
				title:req.body.title,
				time:time.toLocaleDateString()+" "+time.toTimeString(),
				read:0,
				leibie:req.body.leibie,
				comment:comment,
				content:req.body.content,
			});
			arc.save(function(err,that){
				if(err) 
				{
					console.error(err);
				}else{
					console.log('保存数据成功');
					console.log(that);			
				}
			});
		});
		var time = new Date();
		var log = new Log({
			time:time.toLocaleString().split("GMT")[0],
			content:req.body.title+"文章写入"
		});
		log.save(function(err,that){
			if(err) 
			{
				console.error(err);
			}else{
				console.log('保存log数据');
				console.log(that);			
			}
		});
		res.send('success');
	}else{
		console.log('已存在相同url文件！写入失败！');
		res.send('已存在相同url文件！');
	}
});
app.post('/back/save',function(req,res){
	fs.writeFile('saveArc.json',req.body.data,function(err){
		if(err)
		{
			console.log("保存失败");
			res.status(417).send(err);
			return console.error(err);
		}
		console.log('保存文件成功');
		console.log('-------------');
	});
	res.send('success');
});
app.get('/arc/:name',function(req,res){
	var name = req.params.name;
	arcs.findOne({'url':name},function(err,that){
		if(err) console.error(err);

		else if(that === null) res.status(404).render('404');
	
		else 
			{
				res.render("arc/"+name,{
							arc:{
								title:that.title,
								time:that.time,
								comment:that.comment,
								read:that.read,
								leibie:that.leibie
							}
						});
			}
	});

	
});
app.post('/remove',function(req,res){
	value = req.body.value;
	arcs.remove({'url':value},function(err,that){
		if(err) console.error(err);
		else
		{
			if(fs.existsSync('./views/arc/'+value+'.handlebars')){
				fs.unlink('./views/arc/'+value+'.handlebars', function(err,that){
				if(err) console.error(err);
				else 
				{
					var time = new Date();
					var log = new Log({
						time:time.toLocaleString().split("GMT")[0],
						content:"url:"+value+"  此文章删除"
					});
					log.save(function(err,that){
						if(err) 
						{
							console.error(err);
						}else{
							console.log('保存log数据');
							console.log(that);			
						}
					});
					res.send("success");
				}
				});
			}else{
				console.error("error!not found fs but arc had remove!");
				res.send("error");
			}
			
		}
		});

});
app.post('/getComNum',function(req,res){
	var title = req.body.title;
	arcs.findOne({'title':title},function(err,that){
		if(err) console.error(err);
		else
		{	
			res.send({"num":that.comment.number});
		}
	});
});
app.post('/getLei',function(req,res){
	var leibie = req.body.leibie;
	arcs.find({'leibie':leibie},function(err,that){
		if(err) console.error(err);
		else
			res.send(that);
	});
});
app.post('/updata',function(req,res){
	var title = req.body.title;
	var name = req.body.name;
	var email = req.body.email;
	var con = req.body.con;
	var num = req.body.num;
	var time = req.body.time;
	var suzhu={
		"name":name,
		"email":email,
		"con":con,
		"num":num,
		"time":time
	};
	var comment= {};
	arcs.findOne({'title':title},function(err,that){
		if(err) console.error(err);
		else
			{
				comment = that.comment;
				comment.number++;
				comment.content.push(suzhu);
				arcs.update({'title' : title}, {$set : {comment:comment}},function(err){
					if(err) console.error(err);
					else {
						console.log("评论成功添加");
						var time = new Date();
						var log = new Log({
							time:time.toLocaleString().split("GMT")[0],
							content:req.body.title+"有新评论"
						});
						log.save(function(err,that){
							if(err) 
							{
								console.error(err);
							}else{
								console.log('保存log数据');
								console.log(that);			
							}
						});
						res.send('success');
					}
				});
			}
	});
	
});

app.post('/getLog',function(req,res){
	Log.find(function(err,arcslist){
			if(err) 
				console.error(err);
			else
				res.send(arcslist);
		});
});

app.post('/cleanLog',function(req,res){
	if(req.session.login){
		Log.remove({},function(err){
			if(err) console.error(err);
			else 
			{
				var time = new Date();
				var log = new Log({
					time:time.toLocaleString().split("GMT")[0],
					content:"清空LOG"
				});
				log.save(function(err,that){
					if(err) 
					{
						console.error(err);
					}else{
						console.log('保存log数据');
						console.log(that);			
					}
				});
				res.send("删除成功！");
			}
		});
	}
});
app.get('/test/1',function(req,res){
	res.render('test/1');
});
app.get('/test/2',function(req,res){
	res.render('test/2');
});
app.post('/test/2',function(req,res){
	console.log(req.body.data);
	res.redirect(303,'/');
});
app.get('/test',function(req,res){
	req.session.flash = {
		type:"success",
		intro:"Test",
		message:"Just a test",			
	};
	res.render('test/test');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
 	res.status (404);
 	res.render('404');
});

// error handler
app.use(function(err, req, res, next) {
	console.log(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get("port"),function(){
	console.log('Express started on http://localhost:'+app.get("port"));
});
module.exports = app;
