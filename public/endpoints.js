commoncallsettings = "maxDegree1=20&maxDegree2=10"

endpoints =
	{
	clearhistory   : "/rest/terms/clearHistory",
	
	suggestion     : "./sample/suggestion.json?query=",
	didyoumean     : "/rest/terms/didYouMean?query=",
	disambiguation : "./sample/disambiguation.json?query=",
	article        : "/rest/terms/getArticle?topic=",
	
	highlights     : "./sample/expandQuery.json?getMostProbableSenseSynonyms=true&doStemming=true&query=",
	commonconcepts : "/rest/terms/getCommonWords?",
	
	search         : "/rest/terms/graph",
	add            : "/rest/terms/add",
	remove         : "/rest/terms/remove",
	explore        : "/rest/terms/explore",
	path           : "/rest/terms/path",
	edgeinfo       : "./sample/edge.json",
	
	ispdf            : "/rest/terms/isPdf?uri=",
	metadata         : "/rest/terms/getMetadata?uri=",
	documentreader   : "/hariterms/web/viewer.html?file=",
	documentextractor: "/hariterms/article.jsp?uri=",
	getAbstract:"./sample/abstract.json"
	}

docendpoints = 
	{
	disambiguation : "/rest/terms/disambiguation2?query=",
	article        : "/rest/terms/getArticle2?topic=",
	search         : "./sample/graph2.json",
	explore        : "./sample/explore2.json",
	path           : "./sample/path2.json",
	add            : "/rest/terms/add2",
	}
	
endpointsdefaults = 
	{
	maxDegree1 : 20,
	maxDegree2 : 10,
	//number:20,
	//threshold:0.2
	}