forcesettings =
	{
	springLength : 1000,
	springCoeff  : 0.0005,//0.0005,
	dragCoeff    : 0.2,
	gravity      : -50,
	theta        : 0.1,


	smallmass    : 20,
	midmass      : 150,
	bigmass      : 250,
	//theta      : 1
	
	attractors   : 0.002,
	
	maxSpeed     : 4
	}

timings =
	{
	nodePop       : 25,
	nodeEnlarge   : 15,
	nodeStopDelay : 10000,
	nodeStopStep  : 1000,
	}

graphsettings =
	{
	screenfactor : 1,
	minScale     : 0.02,
	initialScale : 0.065,//0.13
	textScale    : 0.035,//0.13
	maxScale     : 0.3,
	zoomspeed    : 0.05,//0.015
	
	// 
	overEnlarge  : 0.2,
	
	// Maximum movement of the system at which system should be considered as stable
	staticDelta  : 50,
	staticCount  : 100
	}
	
generalsettings = 
	{
	minSubCategoryRelevance : 0.0,
	minTopCategoryRelevance : 0.0,
	removeEmptyNodes : false
	}
	
