var express = require('express');
var router = express.Router();
var queries = require("./queries");

var settings = require("../settings");

var elasticsearch = require('elasticsearch');

var clientOpts = {
  host: settings.elastic,
}
var client = new elasticsearch.Client(clientOpts);

var index = settings._index;
var type = settings._type;

//nodes
router.get('/api/space_events', function(req, res, next) {
  var q = queries("space_events");
  client.search({
    index: index,
    type: type,
    body: q
  }).then(function (resp) {
    var hits = resp.aggregations.aggregations.buckets;
    var result = [];
    var promises = [];
    for(var i=0;i<hits.length;i++){
      var r = {};
      r.value = hits[i].doc_count;
      r.weight = hits[i].doc_count/hits[0].doc_count;
      r.spaceName = hits[i].table_hits.hits.hits[0]._source.details.spaceName;
      r.spaceId = hits[i].table_hits.hits.hits[0]._source.details.spaceId;
      result.push(r);
      promises.push(getUsersBySpaceId(r));
    }

    Promise.all(promises).then((users) => {
      console.log("USERS -->",JSON.stringify(users));
      res.json(users);
    });
  }, function (err) {
    console.trace(err.message);
    res.status(500).send({error: err.message});
  });
});


//users
function getUsersBySpaceId(space) {
  return new Promise(
          (fulfill, reject) => {
              var q = queries("space_users");
              q.query.bool.must[0].term["details.spaceId"] = space.spaceId;
              client.search({
                index: index,
                type: type,
                body: q
              }).then((resp) => {
                r = {};
                r.space=space;
                r.users=[];
                hits = resp.hits.hits;
                for (var i in hits) {
                  console.log(hits[i]);
                  r.users.push(hits[i]._source.details.name);
                }
                fulfill(r);
              },(err) => {
                console.trace(err.message);
              })
          }
  )
}


module.exports = router;
