var schema = require('./schema');
var db = require('./db');
var async = require('async');
var data = require('./data');
var users = require('../models/users');
var scunts = require('../models/scavengerHunts');
var teams = require('../models/teams')
var tasks = require('../models/tasks')
var seed = {};

// Defines the order in which these tables can be dropped without violating foreign key constraints
droplist = [
	schema.comments.name,
	schema.teamTaskRel.name,
    schema.teamUserRel.name,
    schema.scuntUserRel.name,
    schema.teams.name,
    schema.users.name,
    schema.tasks.name,
    schema.scunt.name,
]

seed.up = function (done) {
	var tables = Object.keys(schema);
	var qstr = "SET default_storage_engine=INNODB;";
	async.each(tables, function (table) {
		if (schema.hasOwnProperty(table)) {
			qstr += "CREATE TABLE IF NOT EXISTS `" + schema[table].name + "` (";

			for (var field in schema[table].fields) {
				if (schema[table].fields.hasOwnProperty(field)) {
					qstr += "`" + field + "` "; // column name
					qstr += schema[table].fields[field]; // column options
					qstr += ", ";
				}
			}

			for (var constraint in schema[table].constraints) {
				qstr += schema[table].constraints[constraint]; // constraint
				qstr += ", ";
			}

			qstr = qstr.slice(0, -2); // remove last comma
			qstr += ");";
		}
	});
	//console.log("****** query to create tables: " + qstr);

	db.get().query(qstr, [], function (err, result) { //query for table structure
		var i = 0;
		if (err) {
			console.log("****** it fucked up " + err);
		} else {
			console.log("---- Table created Succesfully ----");
		}

		done();
	});
}

seed.down = function (done) {
	var tables = Object.keys(schema);
	tables.reverse();
	var query = "";
	for(var i in droplist) {
		query += "DROP TABLE IF EXISTS `" + droplist[i] + "` CASCADE; ";
	}

	//console.log("****** query to drop tables: " + query);
	db.get().query(query, [], function (err, result) {
		if (err) {
			console.log("it fucked up " + err);
		} else {
			// console.log("---- Tables Removed Succesfully ----");
		}
		done();
	});
}

seed.populate = function(done){
	var now = new Date().toISOString().slice(0, 19).replace('T', ' ');
	async.forEach(data.users, 
		function(user, callback){ 
			users.create(user.username, user.firstName, user.lastName, user.email, user.password, '5147373734', false,'ghjefnkenfef', now ,function(err, usr){
				if(err){
					console.log(err)
					done();
				} else {
					callback()
				}
			});
		},
		function(err) {
			async.forEach(data.scunts, 
				function(scunt, callback){
					scunts.createScunt(scunt.name, scunt.description, scunt.startTime, scunt.endTime, function(err, scnt){
						if(err){
							console.log(err);
							done();
						} else {
							callback();
						}
					})
				},
				function(err){
					if(err){
						console.log(err)
					} 
					async.forEach(data.teams, 
						function(team, callback){
							teams.create(team.name, team.points, team.maxmembers, team.scuntId, team.leaderId, function(err, t){
								if(err){
									console.log(err)
									done();
								} else {
									callback();
								}
							})
						},
						function(err){
							if(err){
								console.log(err)
							}
							async.forEach(data.userToTeam,
								function(userMap, callabck) {
									teams.join(userMap.userId, userMap.teamId, userMap.allowswitch, function(err, res){
										if(err){
											console.log(err);
											done();
										} else {
											callabck();
										}
									})
								},
								function (err) {
									if(err){
										console.log(err)
									}
									async.forEach(data.tasks, 
										function(task, callback) {
											tasks.create(task.taskName, task.description, task.points, task.scuntId, function(err, res) {
												if(err){
													console.log(err)
													done();
												} else {
													callback();
												}
											});
										},
										function(err) {
											if(err){
												console.log(err)
											}
											async.forEach(data.scunts, 
												function(scunt, callback) {
													scunts.publish(scunt.id, function(err){
														if(err){
															console.log(err)
															done(); 
														} else {
															callback();
														}
													});
												},
												function(err) {
													if(err){
														console.log(err)
													}
													async.forEach(data.scunts,
														function(scunt, callback) {
															scunts.start(scunt.id, function(err){
																if(err){
																	console.log(err)
																	done(); 
																} else {
																	callback();
																}
															});
														},
														function(err) {
															if(err){
																console.log(err)
															}
															done(); 
														}
													)
												}
											);
										}
									);
								}
							)
						}
					)
				}
			)
		}
	);
}

module.exports = seed;
