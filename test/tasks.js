var assert = require('assert');
var async = require('async');

var db = require('../database/db');
var seed = require('../database/seeders');
var tasks = require('../models/tasks');
var teams = require('../models/teams');
var scunts = require('../models/scavengerHunts');
var users = require('../models/users');

describe('Tasks Tests', function () {
	before(function (done) {
		db.connect(db, function (err) {
			seed.up(function () {
				done();
			});
		});
	});

	describe('Tasks Creation Tests', function () {
		it('Tasks should be created successfully', function (done) {
			async.waterfall([
				function (callback) {
					// Create scavenger hunt
					var scuntName = 'scuntteamtesttasks';
					var scuntDesc = 'desc';
					var scuntStart = new Date();
					var scuntEnd = new Date();
					scunts.create(scuntName, scuntDesc, scuntStart, scuntEnd, callback);
				},
				function (scuntId, callback) {
					// Create user
					var taskName = 'task number 1';
					var taskDescription = 'This is the task number 1';
					var points = 2;
					tasks.create(taskName, taskDescription, points, scuntId, function (err, id) {
						assert.notStrictEqual(id, null, 'Could not create tasks, id was null');
						assert.strictEqual(err, null, 'tasks create has some invalid sql ' + err);
						callback(err, id);
					});
				}
			], function (err, id) {
				assert.notStrictEqual(id, null, 'Could not create tasks, id was null');
				var query = 'SELECT name FROM tasks WHERE id = ?';
				var values = [id];
				db.get().query(query, values, function (err, result) {
					assert.equal('task number 1', result[0].name);
					done();
				});
			})
		});
		it('Task should not be created successfully when scavenger hunt does not exist', function (done) {
			var taskName = 'task number 2 test';
			var taskDescription = 'This is the task number 2 not created';
			var points = 2;
			var scuntId = '-1';

			tasks.create(taskName, taskDescription, points, scuntId, function (err, id) {
				assert.strictEqual(id, undefined);
				done();
			});
		});
		it('Cannot have two tasks in the same scunt with the same name', function (done) {
			async.waterfall([
				function (callback) {
					// Create scavenger hunt
					var scuntName = 'scuntteamtesttasks2';
					var scuntDesc = 'desc2';
					var scuntStart = new Date();
					var scuntEnd = new Date();
					scunts.create(scuntName, scuntDesc, scuntStart, scuntEnd, callback);
				},
				function (scuntId, callback) {
					// Create task
					var taskName = 'task number 2';
					var taskDescription = 'This is the task number 2';
					var points = 2;
					tasks.create(taskName, taskDescription, points, scuntId, function (err, id) {
						assert.notStrictEqual(id, null, 'Could not create tasks, id was null');
						assert.strictEqual(err, null, 'tasks create has some invalid sql ' + err);
						callback(err, scuntId);
					});
				},
				function (scuntId, callback) {
					// Create task
					var taskName = 'task number 2';
					var taskDescription = 'This is the task number 2';
					var points = 2;
					tasks.create(taskName, taskDescription, points, scuntId, function (err, id) {
						assert.strictEqual(id, undefined, 'Task should not have been created');
						assert.strictEqual(err, 'A task with this name already exists in this scavenger hunt');
						callback(null);
					});
				}
			], function (err) {
				assert.strictEqual(err, null, 'unknown error occured');
				done();
			});
		});
	});

	describe('Task Deletion Tests', function () {
		it('Successful deletion', function (done) {
			async.waterfall([
				function (callback) {
					// Create scavenger hunt
					var scuntName = 'scuntteamtesttasks3';
					var scuntDesc = 'desc';
					var scuntStart = new Date();
					var scuntEnd = new Date();
					scunts.create(scuntName, scuntDesc, scuntStart, scuntEnd, callback);
				},
				function (scuntId, callback) {
					// Create user
					var taskName = 'task number 3';
					var taskDescription = 'This is the task number 3';
					var points = 2;
					tasks.create(taskName, taskDescription, points, scuntId, function (err, id) {
						assert.notStrictEqual(id, null, 'Could not create tasks, id was null');
						assert.strictEqual(err, null, 'tasks create has some invalid sql ' + err);
						callback(err, id);
					});
				},
				function (taskId, callback) {
					tasks.delete(taskId, function (err) {
						callback(err, taskId);
					});
				},
				function (taskId, callback) {
					var query = 'SELECT COUNT(*) AS taskcount FROM tasks WHERE id = ?';
					var values = [taskId];

					db.get().query(query, values, function (err, result) {
						assert.equal(0, result[0].taskcount);
						callback(null);
					});
				}
			], function (err) {
				assert.strictEqual(err, null, 'unknown error occured on happy path team deletion');
				done();
			});
		});

		it('should not crash when the task doesn\'t exist', function (done) {
			async.waterfall([
				function (callback) {
					tasks.delete(-1, function (err) {
						assert.strictEqual(err,'There is no task with this id');
						callback(null);
					});
				}
			], function (err) {
				assert.strictEqual(err, null, 'unknown error occured on happy path team deletion');
				done();
			});
		});
	});

	describe('Task Editing Tests', function () {
		it('Successful editing', function (done) {
			async.waterfall([
				function (callback) {
					// Create scavenger hunt
					var scuntName = 'scuntteamtesttasks4';
					var scuntDesc = 'desc';
					var scuntStart = new Date();
					var scuntEnd = new Date();
					scunts.create(scuntName, scuntDesc, scuntStart, scuntEnd, callback);
				},
				function (scuntId, callback) {
					// Create task
					var taskName = 'task number 4';
					var taskDescription = 'This is the task number 4';
					var points = 2;
					tasks.create(taskName, taskDescription, points, scuntId, function (err, id) {
						assert.notStrictEqual(id, null, 'Could not create tasks, id was null');
						assert.strictEqual(err, null, 'tasks create has some invalid sql ' + err);
						callback(err, id);
					});
				},
				function (taskId,callback) {
					// Create scavenger hunt 2
					var scuntName = 'scuntteamtesttasks4 bis';
					var scuntDesc = 'desc bis';
					var scuntStart = new Date();
					var scuntEnd = new Date();
					scunts.create(scuntName, scuntDesc, scuntStart, scuntEnd, function (err,scuntId) {
						callback(err, taskId,scuntId);
					});
				},
				function (taskId,scuntId, callback) {
					// Edit task
					var taskDict = {};
					taskDict["name"] = 'task number 4 bis';
					taskDict["description"] = 'This is the task number 4 bis';
					taskDict["points"] = 3;
					taskDict["scuntId"] = scuntId;
					tasks.edit(taskId,taskDict, function (err,taskId) {
						callback(err, taskId,scuntId);
					});
				},
				function (taskId,scuntId, callback) {
					var query = 'SELECT name,description,points,scuntId FROM tasks WHERE id = ?';
					var values = [taskId];

					db.get().query(query, values, function (err, result) {
						assert.equal('task number 4 bis', result[0].name);
						assert.equal('This is the task number 4 bis', result[0].description);
						assert.equal(3, result[0].points);
						assert.equal(scuntId, result[0].scuntId);
						callback(null);
					});
				}
			], function (err) {
				assert.strictEqual(err, null, 'unknown error occured on happy path team editing');
				done();
			});
		});

		it('should not crash when the task doesn\'t exist', function (done) {
			async.waterfall([
				function (callback) {
					tasks.edit(-1,{}, function (err) {
						assert.strictEqual(err,'There is no task with this id');
						callback(null);
					});
				}
			], function (err) {
				assert.strictEqual(err, null, 'unknown error occured on happy path team deletion');
				done();
			});
		});
	});

	describe('Task Approval Tests', function () {
		it('Successful Task Approval', function(done) {
			async.waterfall([
				function(callback) {
					var Name = 'taskApprovalScunt';
					var Desc = 'Task Approval scunt';
					var startTime = new Date("September 1, 2016 11:13:00");
					var endTime = new Date("September 13, 2016 11:13:00");
					scunts.create(Name, Desc, startTime, endTime, function (err, id) {
						callback(err, id);
					});
				},
				function(id, callback) {
					scunts.setStatus(id, 'PUBLISHED', function(err, res) {
						callback(err, id);
					});
				},
				function(id,callback) {
					var username = "Eduardo2";
					var firstName = "Eduardo Chupame";
					var lastName = "Coronado";
					var email = "eduardo2.coronado@gmail.com";
					var password = "ilikethehabs";
					var phoneNumber = "(514)911-1234";
					var isAdmin = true;
					var profilePicture = "";
					var date = new Date().toISOString().slice(0, 19).replace('T', ' '); 
					users.create(username, firstName, lastName, email, password, phoneNumber, isAdmin, profilePicture, date,
						function(err, result){
							assert.strictEqual(err, null);
							assert.notStrictEqual(result, null);
							callback(null, id, result, username);
						}
					);
				},
				function(scuntId,leadId, leadname, callback) {
					teams.create("taskApproveteam1", 0,3,scuntId,leadname,"https://drive.google.com/drive/folders/", function(err, res) {
						callback(err, scuntId,res);
					});
				},
				function(scuntId,teamId, callback) {
					// Start the scavenger hunt
					var taskName = 'task number 5';
					var taskDescription = 'This is the task number 5';
					var points = 2;
					tasks.create(taskName, taskDescription, points, scuntId, function (err, id) {
						assert.notStrictEqual(id, null, 'Could not create tasks, id was null');
						assert.strictEqual(err, null, 'tasks create has some invalid sql ' + err);
						callback(err, scuntId,id,teamId);
					});
				},
				function(scuntId,taskId,teamId, callback) {
					// Start the scavenger hunt
					scunts.start(scuntId, function(err) {
						assert.equal(err, null);
						callback(err,taskId,teamId);
					});
				},
				function(taskId,teamId, callback) {
					// Start the scavenger hunt
					tasks.submitTask(taskId,teamId, function(err) {
						assert.equal(err, null);
						callback(err,taskId,teamId);
					});
				},
				function(taskId,teamId, callback) {
					// Start the scavenger hunt
					tasks.approveTask(taskId,teamId, function(err) {
						assert.equal(err, null);
						callback(err,taskId,teamId);
					});
				},
				function(taskId,teamId, callback) {
					// Start the scavenger hunt
					tasks.getTaskStatus(taskId,teamId, function(err,res) {
						assert.equal(err, null);
						assert.equal(res,'COMPLETED');
						callback(err);
					});
				}
			], function(err) {
				assert.equal(err, null);
				done();
			});
		});

		it('Unsuccessful Task Approval', function(done) {
			async.waterfall([
				function(callback) {
					var Name = 'taskbadApprovalScunt';
					var Desc = 'Task badApproval scunt';
					var startTime = new Date("September 1, 2016 11:13:00");
					var endTime = new Date("September 13, 2016 11:13:00");

					scunts.create(Name, Desc, startTime, endTime, function (err, id) {
						callback(err, id);
					});
				},
				function(id, callback) {
					scunts.setStatus(id, 'PUBLISHED', function(err, res) {
						callback(err, id);
					});
				},
				function(id,callback) {
					var username = "Eduardo2 badAppro";
					var firstName = "Eduardo Chupame";
					var lastName = "Coronado";
					var email = "eduardo2badAppro.coronado@gmail.com";
					var password = "ilikethehabs";
					var phoneNumber = "(514)911-1234";
					var isAdmin = true;
					var profilePicture = "";
					var date = new Date().toISOString().slice(0, 19).replace('T', ' '); 
					users.create(username, firstName, lastName, email, password, phoneNumber, isAdmin, profilePicture, date,
						function(err, result){
							assert.strictEqual(err, null);
							assert.notStrictEqual(result, null);
							callback(null, id, result, username);
						}
					);
				},
				function(scuntId, leadId, leadname, callback) {
					teams.create("taskbadApproveteam1", 0,3,scuntId,leadname,"https://drive.google.com/drive/folders/", function(err, res) {
						callback(err, scuntId,res);
					});
				},
				function(scuntId,teamId, callback) {
					// Start the scavenger hunt
					var taskName = 'task number 5';
					var taskDescription = 'This is the task number 5';
					var points = 2;
					tasks.create(taskName, taskDescription, points, scuntId, function (err, id) {
						assert.notStrictEqual(id, null, 'Could not create tasks, id was null');
						assert.strictEqual(err, null, 'tasks create has some invalid sql ' + err);
						callback(err, scuntId,id,teamId);
					});
				},
				function(scuntId,taskId,teamId, callback) {
					// Start the scavenger hunt
					scunts.start(scuntId, function(err) {
						assert.equal(err, null);
						callback(err,taskId,teamId);
					});
				},
				function(taskId,teamId, callback) {
					// Start the scavenger hunt
					tasks.approveTask(taskId,teamId, function(err) {
						assert.equal(err, 'The status transition is not allowed according to the set up lifecycle');
						callback(null);
					});
				}
			], function(err) {
				assert.equal(err, null);
				done();
			});
		});
	});

	describe('Task Rejection Tests', function () {
		it('Successful Task Rejection', function(done) {
			async.waterfall([
				function(callback) {
				var Name = 'taskRejectionScunt';
				var Desc = 'Task Rejection scunt';
				var startTime = new Date("September 1, 2016 11:13:00");
				var endTime = new Date("September 13, 2016 11:13:00");

				scunts.create(Name, Desc, startTime, endTime, function (err, id) {
					callback(err, id);
				});
				},
				function(id, callback) {
				scunts.setStatus(id, 'PUBLISHED', function(err, res) {
					callback(err, id);
				});
				},
				function(id,callback) {
				var username = "Eduardo2Rejection";
				var firstName = "Eduardo Rejection Chupame";
				var lastName = "Coronado";
				var email = "eduardo2Rejection.coronado@gmail.com";
				var password = "ilikethehabs";
				var phoneNumber = "(514)911-1234";
				var isAdmin = true;
				var profilePicture = "";
				var date = new Date().toISOString().slice(0, 19).replace('T', ' '); 
				users.create(username, firstName, lastName, email, password, phoneNumber, isAdmin, profilePicture, date,
					function(err, result){
						assert.strictEqual(err, null);
						assert.notStrictEqual(result, null);
						callback(null, id,result, username);
					}
				);
				},
				function(scuntId,leadId, leadname, callback) {
				teams.create("taskRejectteam1", 0,3,scuntId,leadname,"https://drive.google.com/drive/folders/", function(err, res) {
					callback(err, scuntId,res);
				});
				},
				function(scuntId,teamId, callback) {
				// Start the scavenger hunt
				var taskName = 'task number 5';
				var taskDescription = 'This is the task number 5';
				var points = 2;
				tasks.create(taskName, taskDescription, points, scuntId, function (err, id) {
					assert.notStrictEqual(id, null, 'Could not create tasks, id was null');
					assert.strictEqual(err, null, 'tasks create has some invalid sql ' + err);
					callback(err, scuntId,id,teamId);
				});
				},
				function(scuntId,taskId,teamId, callback) {
				// Start the scavenger hunt
				scunts.start(scuntId, function(err) {
					assert.equal(err, null);
					callback(err,taskId,teamId);
				});
				},
				function(taskId,teamId, callback) {
					// Start the scavenger hunt
					tasks.submitTask(taskId,teamId, function(err) {
						assert.equal(err, null);
						callback(err,taskId,teamId);
					});
				},
				function(taskId,teamId, callback) {
				// Start the scavenger hunt
				tasks.rejectTask(taskId,teamId, function(err) {
					assert.equal(err, null);
					callback(err,taskId,teamId);
				});
				},
				function(taskId,teamId, callback) {
				// Start the scavenger hunt
				tasks.getTaskStatus(taskId,teamId, function(err,res) {
					assert.equal(err, null);
					assert.equal(res,'PENDING');
					callback(err);
				});
				}
			], function(err,taskId,teamId) {
				assert.equal(err, null);
				done();
			});
		});

		it('Unsuccessful Task Rejection', function(done) {
			async.waterfall([
				function(callback) {
				var Name = 'taskbadRejectionScunt';
				var Desc = 'Task badRejection scunt';
				var startTime = new Date("September 1, 2016 11:13:00");
				var endTime = new Date("September 13, 2016 11:13:00");

				scunts.create(Name, Desc, startTime, endTime, function (err, id) {
					callback(err, id);
				});
				},
				function(id, callback) {
				scunts.setStatus(id, 'PUBLISHED', function(err, res) {
					callback(err, id);
				});
				},
				function(id,callback) {
				var username = "Eduardo2badRejection";
				var firstName = "Eduardo badRejection Chupame";
				var lastName = "Coronado";
				var email = "eduardo2badRejection.coronado@gmail.com";
				var password = "ilikethehabs";
				var phoneNumber = "(514)911-1234";
				var isAdmin = true;
				var profilePicture = "";
				var date = new Date().toISOString().slice(0, 19).replace('T', ' '); 
				users.create(username, firstName, lastName, email, password, phoneNumber, isAdmin, profilePicture, date,
					function(err, result){
						assert.strictEqual(err, null);
						assert.notStrictEqual(result, null);
						callback(null, id,result, username);
					}
				);
				},
				function(scuntId,leadId, leadname, callback) {
					teams.create("taskbadRejectteam1", 0, 3, scuntId, leadname, "https://drive.google.com/drive/folders/", function (err, res) {
						callback(err, scuntId, res);
					});
				},
				function(scuntId,teamId, callback) {
					// Start the scavenger hunt
					var taskName = 'task number 5';
					var taskDescription = 'This is the task number 5';
					var points = 2;
					tasks.create(taskName, taskDescription, points, scuntId, function (err, id) {
						assert.notStrictEqual(id, null, 'Could not create tasks, id was null');
						assert.strictEqual(err, null, 'tasks create has some invalid sql ' + err);
						callback(err, scuntId, id, teamId);
					});
				},
				function(scuntId,taskId,teamId, callback) {
					// Start the scavenger hunt
					scunts.start(scuntId, function (err) {
						assert.equal(err, null);
						callback(err, taskId, teamId);
					});
				},
				function(taskId,teamId, callback) {
				// Start the scavenger hunt
				tasks.rejectTask(taskId,teamId, function(err) {
					assert.equal(err, 'The status transition is not allowed according to the set up lifecycle');
					callback(null);
				});
				}
			], function(err,taskId,teamId) {
				assert.equal(err, null);
				done();
			});
		});

	});

	describe('Task Submission Tests', function () {
		it('Successful Task Submission', function(done) {
			async.waterfall([
				function(callback) {
					var Name = 'taskSubmissionScunt';
						var Desc = 'Task Submission scunt';
						var startTime = new Date("September 1, 2016 11:13:00");
						var endTime = new Date("September 13, 2016 11:13:00");

						scunts.create(Name, Desc, startTime, endTime, function (err, id) {
							callback(err, id);
						});
				},
				function(id, callback) {
					scunts.setStatus(id, 'PUBLISHED', function(err, res) {
						callback(err, id);
					});
				},
				function(id,callback) {
						var username = "Eduardo2Submission";
						var firstName = "Eduardo Submission Chupame";
						var lastName = "Coronado";
						var email = "eduardo2Submission.coronado@gmail.com";
						var password = "ilikethehabs";
						var phoneNumber = "(514)911-1234";
						var isAdmin = true;
						var profilePicture = "";
						var date = new Date().toISOString().slice(0, 19).replace('T', ' '); 
						users.create(username, firstName, lastName, email, password, phoneNumber, isAdmin, profilePicture, date,
							function(err, result){
								assert.strictEqual(err, null);
								assert.notStrictEqual(result, null);
								callback(null, id,result, username);
							}
						);
				},
				function(scuntId,leadId, leadname, callback) {
					teams.create("taskSubmitteam1", 0,3,scuntId,leadname,"https://drive.google.com/drive/folders/", function(err, res) {
						callback(err, scuntId,res);
					});
				},
				function(scuntId,teamId, callback) {
					var taskName = 'task number 5';
					var taskDescription = 'This is the task number 5';
					var points = 2;
					tasks.create(taskName, taskDescription, points, scuntId, function (err, id) {
						assert.notStrictEqual(id, null, 'Could not create tasks, id was null');
						assert.strictEqual(err, null, 'tasks create has some invalid sql ' + err);
						callback(err, scuntId,teamId,id);
					});
				},
				function(scuntId,teamId,taskId, callback) {
					// Start the scavenger hunt
					scunts.start(scuntId, function(err) {
						assert.equal(err, null);
						callback(err,taskId,teamId);
					});
				},
				function(taskId,teamId, callback) {
					// Start the scavenger hunt
					tasks.submitTask(taskId,teamId, function(err) {
						assert.equal(err, null);
						callback(err,taskId,teamId);
					});
				},
				function(taskId,teamId, callback) {
					// Start the scavenger hunt
					tasks.getTaskStatus(taskId,teamId, function(err,res) {
						assert.equal(err, null);
						assert.equal(res,'SUBMITTED');
						callback(err);
					});
				}
			], function(err,taskId,teamId) {
				assert.equal(err, null);
				done();
			});
		});

		it('Unsuccessful Task Submission', function(done) {
			async.waterfall([
				function(callback) {
					var Name = 'taskbadSubmissionScunt';
						var Desc = 'Task badSubmission scunt';
						var startTime = new Date("September 1, 2016 11:13:00");
						var endTime = new Date("September 13, 2016 11:13:00");

						scunts.create(Name, Desc, startTime, endTime, function (err, id) {
							callback(err, id);
						});
				},
				function(id, callback) {
					scunts.setStatus(id, 'PUBLISHED', function(err, res) {
						callback(err, id);
					});
				},
				function(id,callback) {
						var username = "Eduardo2badSubmission";
						var firstName = "Eduardo badSubmission Chupame";
						var lastName = "Coronado";
						var email = "eduardo2badSubmission.coronado@gmail.com";
						var password = "ilikethehabs";
						var phoneNumber = "(514)911-1234";
						var isAdmin = true;
						var profilePicture = "";
						var date = new Date().toISOString().slice(0, 19).replace('T', ' '); 
						users.create(username, firstName, lastName, email, password, phoneNumber, isAdmin, profilePicture, date,
							function(err, result){
								assert.strictEqual(err, null);
								assert.notStrictEqual(result, null);
								callback(null, id,result, username);
							}
						);
				},
				function(scuntId,leadId, leadname, callback) {
					teams.create("taskbadSubmitteam1", 0,3,scuntId,leadname,"https://drive.google.com/drive/folders/", function(err, res) {
						callback(err, scuntId,res);
					});
				},
				function(scuntId,teamId, callback) {
					var taskName = 'task number 5';
					var taskDescription = 'This is the task number 5';
					var points = 2;
					tasks.create(taskName, taskDescription, points, scuntId, function (err, id) {
						assert.notStrictEqual(id, null, 'Could not create tasks, id was null');
						assert.strictEqual(err, null, 'tasks create has some invalid sql ' + err);
						callback(err, id, teamId);
					});
				},
				function(taskId,teamId, callback) {
					// Start the scavenger hunt
					tasks.submitTask(taskId,teamId, function(err) {
						assert.equal(err, 'There is no relation between this task and team');
						callback(null);
					});
				}
			], function(err,taskId,teamId) {
				assert.equal(err, null);
				done();
			});
		});

	});

	describe('Comment Tests', function () {
		it('Comment creation', function (done) {
			async.waterfall([
				function (callback) {
					var Name = 'taskCommentScunt';
					var Desc = 'Task Comment scunt';
					var startTime = new Date("September 1, 2016 11:13:00");
					var endTime = new Date("September 13, 2016 11:13:00");

					scunts.create(Name, Desc, startTime, endTime, function (err, id) {
						callback(err, id);
					});
				},
				function (id, callback) {
					scunts.setStatus(id, 'PUBLISHED', function (err, res) {
						callback(err, id);
					});
				},
				function (id, callback) {
					// Create the user
					var username = "commenter1";
					var firstName = "commenter 1";
					var lastName = "commenter 1";
					var email = "commenter1@gmail.com";
					var password = "2134";
					var phoneNumber = "1231231234";
					var isAdmin = true;
					var profilePicture = "";
					var date = new Date();
					users.create(username, firstName, lastName, email, password, phoneNumber, isAdmin, profilePicture, date,
						function (err, result) {
							assert.strictEqual(err, null);
							assert.notStrictEqual(result, null);
							callback(null, id, result, username);
						}
					);
				},
				function (scuntId, leadId, leadname, callback) {
					// Create the team
					teams.create("taskcommentteam1", 0, 3, scuntId, leadname,"https://drive.google.com/drive/folders/", function (err, res) {
						callback(err, scuntId, res, leadId);
					});
				},
				function (scuntId, teamId, leadId, callback) {
					// Create the task
					var taskName = 'task number 5';
					var taskDescription = 'This is the task number 5';
					var points = 2;
					tasks.create(taskName, taskDescription, points, scuntId, function (err, id) {
						assert.notStrictEqual(id, null, 'Could not create tasks, id was null');
						assert.strictEqual(err, null, 'tasks create has some invalid sql ' + err);
						callback(err, scuntId, teamId, id, leadId);
					});
				},
				function (scuntId, teamId, taskId, leadId, callback) {
					// Start the scavenger hunt
					scunts.start(scuntId, function (err) {
						assert.equal(err, null);
						callback(err, taskId, teamId, leadId);
					});
				},
				function (taskId, teamId, leadId, callback) {
					// Comment on the scavenger hunt
					var comment = "this is a test comment";

					tasks.addComment(taskId, teamId, leadId, comment, function(err, id) {
						console.log('comment id: ' + id);
						assert.notStrictEqual(id, null, 'Could not create comment, id was null');
						assert.notStrictEqual(err, null, 'comment creation has some invalid sql ' + err);
						callback(err, id);
					})
				}
			], function (err, taskId, teamId) {
				assert.equal(err, null);
				done();
			});
		});

		it('List Comment', function (done) {
			async.waterfall([
				function (callback) {
					var Name = 'taskComment2Scunt';
					var Desc = 'Task Comment 2 scunt';
					var startTime = new Date("September 1, 2016 11:13:00");
					var endTime = new Date("September 13, 2016 11:13:00");

					scunts.create(Name, Desc, startTime, endTime, function (err, id) {
						callback(err, id);
					});
				},
				function (id, callback) {
					scunts.setStatus(id, 'PUBLISHED', function (err, res) {
						callback(err, id);
					});
				},
				function (id, callback) {
					// Create the user
					var username = "commenter2";
					var firstName = "commenter 2";
					var lastName = "commenter 2";
					var email = "commenter2@gmail.com";
					var password = "2234";
					var phoneNumber = "2232232234";
					var isAdmin = true;
					var profilePicture = "";
					var date = new Date();
					users.create(username, firstName, lastName, email, password, phoneNumber, isAdmin, profilePicture, date,
						function (err, result) {
							assert.strictEqual(err, null);
							assert.notStrictEqual(result, null);
							callback(null, id, result, username);
						}
					);
				},
				function (scuntId, leadId, leadname, callback) {
					// Create the team
					teams.create("taskcommentteam2", 0, 3, scuntId, leadname,"https://drive.google.com/drive/folders/", function (err, res) {
						callback(err, scuntId, res, leadId);
					});
				},
				function (scuntId, teamId, leadId, callback) {
					// Create the task
					var taskName = 'task number 6';
					var taskDescription = 'This is the task number 6';
					var points = 2;
					tasks.create(taskName, taskDescription, points, scuntId, function (err, id) {
						assert.notStrictEqual(id, null, 'Could not create tasks, id was null');
						assert.strictEqual(err, null, 'tasks create has some invalid sql ' + err);
						callback(err, scuntId, teamId, id, leadId);
					});
				},
				function (scuntId, teamId, taskId, leadId, callback) {
					// Start the scavenger hunt
					scunts.start(scuntId, function (err) {
						assert.equal(err, null);
						callback(err, taskId, teamId, leadId);
					});
				},
				function (taskId, teamId, leadId, callback) {
					// Comment on the scavenger hunt
					var comment = "this is a test comment for list";
					tasks.addComment(taskId, teamId, leadId, comment, function(err, id) {
						assert.notStrictEqual(id, null, 'Could not create comment, id was null');
						assert.notStrictEqual(err, null, 'comment creation has some invalid sql ' + err);
						callback(err, taskId,teamId,leadId);
					})
				},
				function (taskId, teamId, leadId, callback) {
					// Comment on the scavenger hunt
					var comment = "this is a second test comment for list";
					tasks.addComment(taskId, teamId, leadId, comment, function(err, id) {
						assert.notStrictEqual(id, null, 'Could not create comment, id was null');
						assert.notStrictEqual(err, null, 'comment creation has some invalid sql ' + err);
						callback(err, taskId, teamId);
					})
				},
				function (taskId, teamId, callback) {
					// Comment on the scavenger hunt
					tasks.listComment(taskId, teamId, function(err, res) {
						assert.notStrictEqual(res, null, 'Could not list comment, res was null');
						assert.notStrictEqual(err, undefined, 'Comment creation has some invalid sql ' + err);
						callback(null);
					})
				}
			], function (err) {
				assert.equal(err, null);
				done();
			});
		});
	});
});
