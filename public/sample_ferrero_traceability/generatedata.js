var token = "paMmYAUQJAKyswxgeyboQdimlsjhdtIhlXdLDhRufoGVsfsaYNuquAcEmRolYBhB";

function generateSupplier(){
    var final = {
        "id": "bIlfEBOwga",
        "topics": [
            {
                "text": "A"
            }
        ],
        "nodes":[],
        "edges":[],
    };

    $.get("https://bus002fer.exentriq.com/91106/api/consolidations/9/json?&sessionToken="+token+"&cert_lot=&certification=&farmer_name=&gender=&supplier=Cocoanect%20NIG%20GBEMTAN&page=1&size=100&rand=1580398206202",
        function(result){
            var array = [];
            $(result).each(function(idx,el){

                console.log(array.indexOf("" + el.cert_lot));
                if(array.indexOf("" + el.cert_lot) >= 0){
                    return null;
                }
                array.push("" + el.cert_lot);
                console.log(array);

                final.nodes.push(
                {
                    "id":el.cert_lot,
                    "referenceId":el.cert_lot,
                    "relevance":1.0,
                    "label":"Lot #" + el.cert_lot,
                    "category":"",
                    "topics":{"A":1},
                    "isCooc":true,
                    "isDocument":true,
                    "articleUri":""
                });

                final.edges.push(
                    {
                        "id":"5_" + el.cert_lot,
                        "startNode":5,
                        "endNode":el.cert_lot,
                        "relevance":1
                    }
                );

            });

            console.log(JSON.stringify(final));
    })
}


function generateLot(lotId){
    var final = {
        "id": "bIlfEBOwga",
        "topics": [
            {
                "text": "A"
            }
        ],
        "nodes":[],
        "edges":[],
    };

    $.get("https://bus002fer.exentriq.com/91106/api/consolidations/9/json?&sessionToken="+token+"&cert_lot="+lotId+"&certification=&farmer_name=&gender=&supplier=Cocoanect%20NIG%20GBEMTAN&page=1&size=100&rand=1580398206202",
        function(result){
            var array = [];
            $(result).each(function(idx,el){

                var id = hashCode(el.farmer_code);
                if(array.indexOf("" + id) >= 0){
                    return null;
                }
                array.push("" + id);

                final.nodes.push(
                    {
                        "id":id,
                        "referenceId":el.farmer_code,
                        "relevance":1.0,
                        "label": el.farmer_name,
                        "category":"",
                        "topics":{"A":1},
                        "isCooc":true,
                        "isDocument":true,
                        "articleUri":""
                    });

                final.edges.push(
                    {
                        "id":lotId + "_" + id,
                        "startNode":lotId,
                        "endNode":id,
                        "relevance":1
                    }
                );

            });
            console.log(JSON.stringify(final));
        })
}


function hashCode(s) {
    for(var i = 0, h = 0; i < s.length; i++)
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    return h;
}