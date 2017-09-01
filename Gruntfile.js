module.exports = function(grunt){
	

	grunt.initConfig({
		cafemocha:{
			all:{src:'qa/test-*.js',option:{ ui:'tdd' }}
		},
		jshint:{
			app:['app.js','public/js/**/*.js','lib/**/*.js'],
			qa:['Gruntfile.js','public/qa/**/*.js','qa/**/*.js']
		},
		linkChecker:{
			dev:{
				site:'localhost',
				options:{
					initialPort:3000
				}
			}
		}
	});
	
	[
		'grunt-cafe-mocha',
		'grunt-contrib-jshint',
		'grunt-link-checker'

	].forEach(function(task){
		grunt.loadNpmTasks(task);
	});

	grunt.registerTask('default',['cafemocha','jshint','linkChecker']);
};