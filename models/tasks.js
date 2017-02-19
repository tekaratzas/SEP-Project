var db = require("../database/db.js");
var async = require('async');

var tasks = {}

tasks.list = function(scuntId, done) {
	var query = 'SELECT * FROM tasks WHERE scuntId = ?';
	var values = [scuntId];

	db.get().query(query, values, done);
}

tasks.create = function(taskName, description, points, scuntId, done) {
	console.log('create');
	var now = new Date().toISOString().slice(0, 19).replace('T', ' ');

	async.waterfall([
		function(callback) {
			// Check if there is a task with the same name
			// might be unnecessary
			// TODO
			var query = 'SELECT COUNT(*) AS duplicateTask FROM tasks WHERE name = ? AND scuntId = ?';
			var values = [taskName, scuntId];

			db.get().query(query, values, function(err, result) {
				if (err) {
					callback(err);
				} else if (result[0].duplicateTask > 0) {
					callback('A task with this name already exists in this scavenger hunt');
				} else {
					callback(null);
				}
			});
		},
		function(callback) {
			// Create task entry
			var query = 'INSERT INTO tasks (name, description, points, scuntId, createdAt, updatedAt) '
						+ 'VALUES(?, ?, ?, ?, ?, ?)';
			var values = [taskName, description, points, scuntId, now, now];
			db.get().query(query, values, function (err, result) {
				if (err) {
					callback(err);
				} else {
					var taskId = result.insertId;
					callback(undefined, taskId)
				}
			});
		}
	], function(err, taskId) {
		console.log("Tasks "+taskId+" Created Successfully")
		done(err, taskId);
	});
}

tasks.edit = function(taskID,editDict, done) {
	console.log('edit');
	async.waterfall([
		function(callback) {
			// Check if there is a task with the same name
			// might be unnecessary
			// TODO
			console.log("test");
			var query = 'SELECT COUNT(*) AS duplicateTask FROM tasks WHERE id = ?';
			var values = [taskID];

			db.get().query(query, values, function(err, result) {
				if (err) {
					callback(err);
				} else if (result[0].duplicateTask == 0) {
					callback('A task with this name does not exists');
				} else {
					callback(null);
				}
			});
		},
		function(callback) {
			// Create task entry
			var query = 'UPDATE tasks SET ';
			for (var field in editDict) {
				if (editDict.hasOwnProperty(field)) {
					query += field ; // column name
					query += "= '"+editDict[field]+"'"; // column options
					query += ", ";
				}
			}

			var now = new Date().toISOString().slice(0, 19).replace('T', ' ');
			query += " updatedAt ='"+now
					+ "' WHERE id = '" + taskID +"';"

			db.get().query(query, function (err, result) {
				if (err) {
					callback(err);
				} else {
					callback(undefined, result)
				}
			});
		}
	], function(err, taskId) {
		done(err, taskId);
	});
}

tasks.delete = function (taskId, done) {
	console.log('delete');
	var query = 'DELETE FROM tasks WHERE id = ?';
	values = [taskId];

	db.get().query(query, values, function (err, result) {
		done(err);
	})
}

module.exports = tasks;