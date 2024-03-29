var assert = require('assert');
var async = require('async');

var db = require('../database/db');
var seed = require("../database/seeders");
var users = require('../models/users');

describe('User Tests', function(){
    before(function (done) {
        db.connect(db, function (err) {
            seed.up(function () {
                done();
            });
        });
    });

    describe('User Creation', function(){
        var username = "Eduardo";
        var firstName = "Eduardo";
        var lastName = "Coronado";
        var email = "eduardo.coronado@gmail.com";
        var password = "ilikethehabs";
        var phoneNumber = "(514)911-1234";
        var isAdmin = true;
        var profilePicture = "";
        var date = new Date().toISOString().slice(0, 19).replace('T', ' ');

        it('should create user successfully', function(done){
            async.waterfall([
                function(callback){
                    users.create(username, firstName, lastName, email, password, phoneNumber, isAdmin, profilePicture, date,
                        function(err, result){
                            assert.strictEqual(err, null);
                            assert.notStrictEqual(result, null);
                            callback(null, result);
                        }
                    );
                }, function(id, callback){
                    users.findById(id, function(err, result){
                        if(err) callback(err);
                        else callback(null, result);
                    });
                }, function(result, callback){
                    assert(result.length, 1);
                    var user = result[0];
                    assert(user.firstName, firstName);
                    assert(user.lastName, lastName);
                    assert(user.email, email);
                    assert(user.phoneNumber, phoneNumber);
                    assert(user.createdAt, date);
                    callback(null);
                }],
                function(err){
                    assert.equal(err, null);
                    done();
            });
        });

        it('should not create user with null name', function(done){
            async.waterfall([
                function(callback){
                    nullName = null;
                    errorEmail = "error@email.com";
                    users.create(nullName, firstName, lastName, errorEmail, password, phoneNumber, isAdmin, profilePicture, date,
                        function(err, result){
                            assert.notStrictEqual(err, null);
                            callback(null, errorEmail);
                        }
                    );
                }, function(errorEmail, callback){
                    users.findByEmail(errorEmail, function(err, result){
                        assert.equal(result.length, 0);
                        callback(null)
                    });
                }
            ], function(err){
                done()
            });
        });

        it('should not create user with empty string', function(done){
            async.waterfall([
                function(callback){
                    emptyName = "";
                    errorEmail = "error@email.com";
                    users.create(emptyName, firstName, lastName, errorEmail, password, phoneNumber, isAdmin, profilePicture, date,
                        function(err, result){
                            assert.notEqual(err, null);
                            callback(null, errorEmail);
                        }
                    );
                }, function(errorEmail, callback){
                    users.findByEmail(errorEmail, function(err, result){
                        assert.equal(result.length, 0);
                        callback(null)
                    });
                }
            ], function(err){
                done()
            });
        })

        it('should change phone number', function(done){
            var email = "eduardo.coronado@gmail.com";
            var fields = ["phoneNumber"];
            var values = ["(514)911-4321"];
            async.waterfall([
                function(callback){
                    users.update(email, fields, values, function(err, result){
                        assert(result.affectedRows, 1);
                        assert(result.changedRows, 1);
                        callback(null);
                    });
                }, function(callback){
                    users.findByEmail(email, function(err, result){
                        assert(result.length, 1);
                        assert(result[0].phoneNumber, values[0]);
                        callback(null)
                    })
                }
            ], function(err){
                done();
            });

        });

        it('should change user firstName and lastName', function(done){
            var email = "eduardo.coronado@gmail.com";
            var fields = ["firstName", "lastName"];
            var values = ["Michael", "Abdallah"];
            async.waterfall([
                function(callback){
                    users.update(email, fields, values, function(err, result){
                        assert(result.affectedRows, 1);
                        assert(result.changedRows, 1);
                        callback(null);
                    });
                }, function(callback){
                    users.findByEmail(email, function(err, result){
                        assert(result.length, 1);
                        assert(result[0].firstName, values[0]);
                        assert(result[0].lastName, values[1]);
                        callback(null)
                    })
                }
            ], function(err){
                done();
            });
        });

        it('should change password', function(done){
            var email = "eduardo.coronado@gmail.com";
            var fields = ["password"];
            var values = ["vivamexico"];
            async.waterfall([
                function(callback){
                    users.update(email, fields, values, function(err, result){
                        assert(result.affectedRows, 1);
                        assert(result.changedRows, 1);
                        callback(null);
                    });
                }, function(callback){
                    users.findByEmail(email, function(err, result){
                        assert.strictEqual(err, null);
                        assert(result.length, 1);
                        assert(result[0].password, values[0]);
                        callback(err)
                    })
                }
            ], function(err){
                assert.equal(err,null);
                done();
            });
        });
    });

    describe('login',function(){
        
        
        var firstName = "Reginald";
        var lastName = "McGee";
        var email = "reginald.mcgee@gmail.com";
        var password = "myhandareyuge";
        var phoneNumber = "(514)911-1234";
        var isAdmin = true;
        var profilePicture = "";
        var date = new Date().toISOString().slice(0, 19).replace('T', ' ');


        it('login successful',function(){

            async.waterfall([
                function(callback){
                    var username = "Coolio";
                    users.create(username, firstName, lastName, email, password, phoneNumber, isAdmin, profilePicture, date,
                        function(err, result){
                            assert.strictEqual(err, null);
                            assert.notStrictEqual(result, null);
                            callback(null, result);
                        }
                    );
                },function(id, callback){
                    users.login(username, password,function(err, result){
                        assert.strictEqual(id, result);
                        callback(err);
                    });
                    
                }],
                function(err){
                    assert.equal(err, null);
                    done();
            });

        });

        it('login unsuccesful', function(){
            async.waterfall([
                function(callback){
                    var username = "xxXNoScopeXxx";
                    users.create(username, firstName, lastName, email, password, phoneNumber, isAdmin, profilePicture, date,
                        function(err, result){
                            assert.strictEqual(err, null);
                            assert.notStrictEqual(result, null);
                            callback(null, result);
                        }
                    );                    
                },
                function(id,callback)
                {
                    users.login(username, "smallHand", function(err,result){
                        assert.notStrictEqual(err, null);
                        callback(err);
                    });
                }],
                function(err){
                    assert.equal(err,null);
                    done();
            });
            
        });
              
    });
});
