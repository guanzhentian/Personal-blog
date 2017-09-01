module.exports = function(req,res){
	name = req.body.name;
	pas = req.body.password;
	if(name === "guanzhentian" && pas === "guanzhentian")
	{
		req.session.login = {
			level:5,
		};
		res.redirect(303,'/back');		
	}else{
		res.render('login',{
			flash:{
				type:'danger',
				info:'password of name wrong',
				message:'password or name wrong,please input again'
			}
		});
	}
};	