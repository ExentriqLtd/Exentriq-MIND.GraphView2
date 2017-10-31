"use strict";

var queries = {};
/*
 * spaces
 */
queries.space_events = {
  "aggs" : {
    "aggregations" : {
      "terms" : {
        "field" : "details.spaceId",
        "size":20
      },
      "aggs": {
        "table_hits": {
          "top_hits": {
            "size":1,
            "_source": {
              "includes": ["details.spaceName","details.spaceId"]
            },
          }
        }
      }
    }
  }
};

/*
*
*/
queries.space_users = {
  "size": 1000,
  "query": {
    "bool": {
      "must": [
        {"term": {"details.spaceId":"spaceId"}},
        {"term": {"general.type": "Team"}},
        {"term": {"details.type": "user"}}
      ]
    }
  }
};

var builder = function(queryName){
  var q = queries[queryName];
  return JSON.parse(JSON.stringify(q));
}

module.exports = builder;
