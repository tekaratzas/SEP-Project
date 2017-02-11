var express = require('express');
var scunt = require('../models/scavengerHunts');
var db = require('./../database/db.js')
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('this is the scunt app');
});

router.post('/create-ScavengerHunt', function(req, res, next) {
    var ScuntName = req.query.name;
    var ScuntDesc = req.query.description;
    var ScuntStart = new Date(Date.parse(req.query.startTime));
    var ScuntEnd  = new Date(Date.parse(req.query.endTime));

  scunt.create(ScuntName, ScuntDesc, ScuntStart,ScuntEnd, function(err, id){
    if(err)
    {
      res.status(500).send("An error occurred");
    }else{
      res.send(id.toString());
    }
   });
});


module.exports = router;