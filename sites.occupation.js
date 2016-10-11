let Roles = require("roles");
let Hive = require("hive");

let _CPU = require("util.cpu");

module.exports = {
	
	Run: function(rmColony, rmOccupy, spawnDistance, listPopulation, listTargets, listRoute) {
		if (Hive.isPulse_Spawn()) {
			_CPU.Start(rmColony, `Occupy-${rmOccupy}-runPopulation`);
			this.runPopulation(rmColony, rmOccupy, spawnDistance, listPopulation);
			_CPU.End(rmColony, `Occupy-${rmOccupy}-runPopulation`);
		}
		
		_CPU.Start(rmColony, `Occupy-${rmOccupy}-runCreeps`);
		this.runCreeps(rmColony, rmOccupy, listTargets, listRoute);
		_CPU.End(rmColony, `Occupy-${rmOccupy}-runCreeps`);
	},
	
	runPopulation: function(rmColony, rmOccupy, spawnDistance, listPopulation) {		
        let lSoldier  = _.filter(Game.creeps, (c) => c.memory.role == "soldier" && c.memory.room == rmOccupy && (c.ticksToLive == undefined || c.ticksToLive > 80));
		let lArcher  = _.filter(Game.creeps, (c) => c.memory.role == "archer" && c.memory.room == rmOccupy && (c.ticksToLive == undefined || c.ticksToLive > 80));
		let lHealer  = _.filter(Game.creeps, (c) => c.memory.role == "healer" && c.memory.room == rmOccupy && (c.ticksToLive == undefined || c.ticksToLive > 80));
        
        let popTarget = 
			(listPopulation["soldier"] == null ? 0 : listPopulation["soldier"]["amount"])
			+ (listPopulation["archer"] == null ? 0 : listPopulation["archer"]["amount"])
			+ (listPopulation["healer"] == null ? 0 : listPopulation["healer"]["amount"]);
			
        let popActual = lSoldier.length + lArcher.length + lHealer.length;
        Hive.populationTally(rmColony, popTarget, popActual);

        if (listPopulation["soldier"] != null && lSoldier.length < listPopulation["soldier"]["amount"]) {            
			Memory["spawn_requests"].push({ room: rmColony, distance: spawnDistance, priority: 1, level: listPopulation["soldier"]["level"], 
				body: "soldier", name: null, args: {role: "soldier", room: rmOccupy, colony: rmColony} });
        } else if (listPopulation["archer"] != null && lArcher.length < listPopulation["archer"]["amount"]) {            
			Memory["spawn_requests"].push({ room: rmColony, distance: spawnDistance, priority: 1, level: listPopulation["archer"]["level"], 
				body: "archer", name: null, args: {role: "archer", room: rmOccupy, colony: rmColony} });
        } else if (listPopulation["healer"] != null && lHealer.length < listPopulation["healer"]["amount"]) {
			Memory["spawn_requests"].push({ room: rmColony, distance: spawnDistance, priority: 1, level: listPopulation["healer"]["level"], 
				body: "healer", name: null, args: {role: "healer", room: rmOccupy, colony: rmColony} });            
        }
	},
	
	runCreeps: function(rmColony, rmOccupy, listTargets, listRoute) {		
		let creeps = _.filter(Game.creeps, c => c.memory.room == rmOccupy && c.memory.colony == rmColony);
		
        for (let c in creeps) {
            let creep = creeps[c];
            
			creep.memory.listRoute = listRoute;

			if (creep.memory.role == "soldier") {
				Roles.Soldier(creep, true, listTargets);
			} else if (creep.memory.role == "archer") {
				Roles.Archer(creep, true, listTargets);
			} else if (creep.memory.role == "healer") {
				Roles.Healer(creep);
			}   
        }
	}
};