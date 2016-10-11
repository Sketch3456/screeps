require("overload.creep");
require("overload.roomposition");

let Sites = require("sites");
let Hive = require("hive");
let _CPU = require("util.cpu");

module.exports.loop = function () {

	/* Prepare CPU profiler */
	_CPU.Init();

    /* Prepare memory for this tick */
    Hive.clearDeadMemory();
    Hive.initMemory();
    Hive.initTasks();



	/* Ally list <3 */
	Memory["allies"] = [
		"Pantek59", "king_lispi", "Atavus", "BlackLotus",
		"Moria", "Atlan", "Ashburnie", "seancl", "Finndibaen" ];

	/* Auto-sell excess stockpile */
	Hive.sellExcessResources({
		O: { limit: 250000 },
		H: { limit: 250000 },
		U: { limit: 150000 },
		L: { limit: 150000 },
		Z: { limit: 150000 },
		K: { limit: 150000 } });

	Hive.moveExcessEnergy(200000);


	  /* Generic population definitions */
    let Population__Colony_RCL8 = 
        { worker:   {level: 7, amount: 1, scale_level: false},
          repairer: {level: 5, amount: 1} };
    let Population__Colony_Grow = 
        { worker:   {level: 7, amount: 1},
          repairer: {level: 5, amount: 1},
          upgrader: {level: 7, amount: 2} };
    let Population__Colony_Pace = 
        { worker:   {level: 7, amount: 1},
          repairer: {level: 5, amount: 1},
          upgrader: {level: 7, amount: 1} };
    let Population__Colony_Pump = 
        { worker:   {level: 7, amount: 1},
          repairer: {level: 5, amount: 1},
          upgrader: {level: 7, amount: 4} };
    let Population__Colony_Make = 
        { worker:   {level: 7, amount: 2},
          repairer: {level: 5, amount: 1},
          upgrader: {level: 7, amount: 1} };
    let Population__Colony_Stop = 
        { worker:   {level: 7, amount: 0},
          repairer: {level: 5, amount: 1},
          upgrader: {level: 7, amount: 0} };

    let Population__Mining_1S_Colony =
        { burrower:  {level: 5, amount: 1},
          carrier:   {level: 6, amount: 3},
	      extractor: {level: 8, amount: 1} };
    let Population__Mining_2S_Colony = 
        { burrower:  {level: 6, amount: 1},
          carrier:   {level: 7, amount: 3},
		  extractor: {level: 8, amount: 1} };
    let Population__Mining_1S_Remote =
        { burrower:  {level: 5, amount: 1},
          carrier:   {level: 7, amount: 2},
          multirole: {level: 6, amount: 1},
          reserver:  {level: 6, amount: 1} };
    let Population__Mining_2S_Remote =
        { burrower:  {level: 6, amount: 1},
          carrier:   {level: 7, amount: 3},
          multirole: {level: 6, amount: 1},
          reserver:  {level: 6, amount: 1} };

    let Population__Industry =
        { courier:   {level: 5, amount: 1} };


     /* Garrison for W57S39 */
    Sites.Colony("W57S39", 3, Population__Colony_Pace,
        [ {id: "57f2b16fa71595c4596289ad", role: "send"},
          {id: "57f2d46d974cf3067ff568e8", role: "receive"},
         /* {id: "57f8669b90f6daf66dabaf0b", role: "receive"} */] );
    Sites.Mining("W57S39", "W57S39", 3, false, Population__Mining_1S_Colony);
    Sites.Industry("W57S39", 1, Population__Industry);

        /* Outpost for W57S39 -> W58S39 */
        Sites.Mining("W57S39", "W58S39", 3, false, Population__Mining_2S_Remote);

    /* Run end-tick Hive functions */
    Hive.processSpawnRequests();
    Hive.processSpawnRenewing();

	/* Finish the profiler cycle */
	_CPU.Finish();
};
