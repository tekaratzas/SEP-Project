var db = require("../database/db.js");

var scunt = {}

scunt.create = function(name, description, startTime, endTime, done) {
    var values = [name, description, startTime.toISOString(0,19).replace('T', ' '),endTime.toISOString(0,19).replace('T', ' '), 
                                    new Date().toISOString().slice(0, 19).replace('T', ' '),new Date().toISOString().slice(0, 19).replace('T', ' ')];

    db.get().query('INSERT INTO scunt (name, description, startTime,endTime, createdAt, updatedAt) VALUES(?, ?, ?, ?, ?, ?)', values, function(err, result) {
        if (err) {
            console.log(err)
        }
    })
}

scunt.update = function(id , name, description, startTime, endTime, done){
    var values = [name, description, startTime.toISOString(0,19).replace('T', ' '),endTime.toISOString(0,19).replace('T', ' '), 
                                                                        new Date().toISOString().slice(0, 19).replace('T', ' '), id];
    
    db.get().query('UPDATE scunt SET name = ?, description = ? , startTime = ?, endTime = ?, updatedAt = ? WHERE id = ?', values, function(err, result) {
        if (err) {
            console.log(err)
        }
    })

}

module.exports = scavengerHunts;