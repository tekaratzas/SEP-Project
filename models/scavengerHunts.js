var db = require("../database/db.js");
var async = require('async');
var scunt = {}

scunt.createScunt = function(name, description, startTime, endTime, done) {
    var date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    var values = [name, description, 'PENDING', startTime ,endTime, date, date];
    var query = 'INSERT INTO scunt (name, description, status, startTime, endTime, createdAt, updatedAt) VALUES(?, ?, ?, ?, ?, ?, ?)';

    db.get().query(query, values, function(err, result) {
        if (err) {
            done(err, undefined);
        } else {
            done(undefined, result.insertId);
        }
    })
}

scunt.create = function(name,description, startTime, endTime, done){
    async.waterfall([
        //checks if scunt already exist
        function(callback){
            var query = 'SELECT COUNT(*) AS duplicateScunt FROM scunt where name =?';
            var values = [name];
            db.get().query(query , values, function(err,result){
                if (err){
                    callback(err);
                } else if (result[0].duplicateScunt > 0 ) {
                    callback('Scunt with same name already exist')
                } else{
                    callback(null);
                }
            });
        },
        function(callback){
            var sTime = startTime.toISOString().slice(0, 19).replace('T', ' ');
            var eTime = endTime.toISOString().slice(0, 19).replace('T', ' ');
            scunt.createScunt(name,description, sTime, eTime , done);
        }
    ],function(err, scuntId){
        done(err,scuntId);
    });

}

scunt.setStatus = function(id, status, done) {
    var updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    var validStatuses = ['PENDING', 'PUBLISHED', 'STARTED', 'FINISHED'];
    if (validStatuses.indexOf(status) == -1) {
        return done('An invalid status was used');
    }

    var query = 'UPDATE scunt SET status = ?, updatedAt = ? WHERE id = ?';
    var values = [status, updatedAt, id];

    db.get().query(query, values, function(err, result) {
        done(err, result);
    });
}

scunt.start = function(id, done) {
    async.waterfall([
		function(callback) {
            var query = `
                SELECT startTime FROM scunt WHERE id = ?
            `
            var values = [id];

            db.get().query(query, values, function(err, res) {
                if (err) {
                    callback(err);
                } else if (!res[0]) {
                    callback('Scavenger hunt not found');
                } else {
                    var startTime = new Date(Date.parse(res[0].startTime));
                    var now = new Date();
                    if (now < startTime) {
                        callback("The Scavenger Hunt cannot be started yet, it begins on " + startTime.toString());
                    } else {
                        callback(null);
                    }
                }
            })
        },
		function(callback) {
            scunt.setStatus(id, 'STARTED', function (err, res) {
                callback(err);
            });
        },
        function(callback) {
            var query = `
                INSERT INTO teamTaskRel (teamId, taskId, status, createdAt, updatedAt)
                SELECT teams.id, tasks.id, 'INCOMPLETE', NOW(), NOW()
                FROM tasks
                JOIN scunt ON tasks.scuntId = scunt.id
                JOIN teams ON teams.scuntId = tasks.scuntId
                WHERE scunt.id = ?
            `
            var values = [id];

            db.get().query(query, values, function(err, res) {
               callback(err);
            });
        }
    ], function (err) {
        done(err);
    });
}

scunt.close = function(scuntId, done) {
    async.waterfall([
        function(callback){
            var query = 'SELECT COUNT(*) AS uniqueScunt FROM scunt where id =?';
            var values = [scuntId];
            db.get().query(query , values, function(err,result){
                if(err){
                    callback(err);
                }else if(result[0].uniqueScunt == 0 )
                {
                    callback('Scunt with this id doesn\'t exist')
                }else{
                    callback(null);
                }
            });
        },
        function(callback) {
            scunt.setStatus(scuntId, 'FINISHED', function (err, res) {
                callback(err,scuntId);
            });
        }
    ], function (err,scuntId) {
        done(err,scuntId);
    });
}

scunt.findById = function (id, done) {
    var query = 'SELECT id, name, description, status, startTime AS start, endTime AS end, createdAt AS created, updatedAt AS updated FROM scunt WHERE id = ?';
    var values = [id];
    db.get().query(query, values, function (err, result) {
        if (err) done(err);
        else done(null, result);
    })
}

scunt.update = function (id, name, description, startTime, endTime, done) {
    var sTime = startTime.toISOString().slice(0, 19).replace('T', ' ');
    var eTime = endTime.toISOString().slice(0, 19).replace('T', ' ');
    var UpdatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    var values = [name, description, sTime, eTime, UpdatedAt, id];
    var query = 'UPDATE scunt SET name = ?, description = ? , startTime = ?, endTime = ?, updatedAt = ? WHERE id = ?'

    db.get().query(query, values, function (err, result) {
        if (err) {
            done(err, undefined);
        } else {
            done(undefined, result);
        }
    });
}

scunt.list = function (done) {
    var query = 'SELECT id, name, description, status, startTime AS start, endTime AS end, createdAt AS created, updatedAt AS updated '
        + 'FROM scunt';

    db.get().query(query, null, done);
}

scunt.getStatus = function(ScuntId, done)
{
    var value = [ScuntId];
    var query = 'SELECT status FROM scunt WHERE id = ?';

    db.get().query(query, value, done);
}

scunt.delete = function (id, done) {
    var query = 'DELETE FROM scunt WHERE id = ?';
    var values = [id];

    db.get().query(query, values,  function (err) {
        if (err) {
            done(err, undefined);
        } else {
            done(undefined, id);
        }
    });
}

scunt.getTimeRemaining = function(id, done) {
    var query = 'SELECT endTime AS end FROM scunt WHERE id = ?';
    var values = [id];

    db.get().query(query, values, function(err, result) {
        done(err, result);
    });
}

module.exports = scunt;
