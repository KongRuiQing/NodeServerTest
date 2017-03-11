var Sequelize = require("sequelize");

var sequelize = new Sequelize('find', 'eplus-find', 'eplus-find', {
    host: '139.224.227.82',
    port:3306,
    dialect: 'mysql'
});

var UserLogin = sequelize.import("./model/user_login.js");

exports.updateUserLogin = function(id,longitude,latitude){
	UserLogin.update({
		'longitude' : longitude,
		'latitude' : latitude,
	},{
		'where':{
			'id':id
		}
	}).then(function(affected_numbers,result1){
		console.log(affected_numbers);
		console.log(result1);
	});
}