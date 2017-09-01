var getNumber = require('./lib/getNumber.js');
var expect = require('chai').expect;

suite("Number test",function(){
	test("getNumber() should return random number",function(){
		expect(typeof getNumber.getNumber() === Number);
	});
});