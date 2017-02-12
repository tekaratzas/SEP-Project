var db = require("../database/db.js");

var scunt = {}

scunt.create = function(name, description, startTime, endTime, done) {

    var sTime = startTime.toISOString().slice(0, 19).replace('T', ' ');
    var eTime = endTime.toISOString().slice(0, 19).replace('T', ' ');
    var date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    var values = [name, description,sTime ,eTime, date, date];
    var query = 'INSERT INTO scunt (name, description, startTime, endTime, createdAt, updatedAt) VALUES(?, ?, ?, ?, ?, ?)';

    db.get().query(query, values, function(err, result) {
        if (err) {
            done(err, undefined);
        } else {
            done(undefined, result.insertId);
        }
    })
}

scunt.update = function(id , name, description, startTime, endTime, done){

    var sTime = startTime.toISOString().slice(0, 19).replace('T', ' ');
    var eTime = endTime.toISOString().slice(0, 19).replace('T', ' ');
    var UpdatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    var values = [name, description, sTime,eTime, UpdatedAt, id];
    var query = 'UPDATE scunt SET name = ?, description = ? , startTime = ?, endTime = ?, updatedAt = ? WHERE id = ?'
    
    db.get().query(query, values, function(err, result) {
        if (err) {
            done(err, undefined);
        }else{
            done(undefined, 'success');
        }
    })

}

module.exports = scunt;