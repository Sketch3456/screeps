let _CPU = require("util.cpu");
let Hive = require("hive");

module.exports = {
	
	Run: function(rmColony, rmHarvest, spawnDistance, hasKeepers, listPopulation, listRoute) {

		if (Hive.isPulse_Spawn()) {
			_CPU.Start(rmColony, `Mining-${rmHarvest}-runPopulation`);
			this.runPopulation(rmColony, rmHarvest, spawnDistance, hasKeepers, listPopulation);
			_CPU.End(rmColony, `Mining-${rmHarvest}-runPopulation`);
		}
	
		_CPU.Start(rmColony, `Mining-${rmHarvest}-runCreeps`);
		this.runCreeps(rmColony, rmHarvest, hasKeepers, listRoute);
		_CPU.End(rmColony, `Mining-${rmHarvest}-runCreeps`);
	},
	
	
	runPopulation: function(rmColony, rmHarvest, spawnDistance, hasKeepers, listPopulation) {		
		let lPaladin = _.filter(Game.creeps, c => c.memory.role == "paladin" && c.memory.room == rmHarvest && (c.ticksToLive == undefined || c.ticksToLive > 200));
		let lHealer = _.filter(Game.creeps, c => c.memory.role == "healer" && c.memory.room == rmHarvest && (c.ticksToLive == undefined || c.ticksToLive > 100));		
		let lBurrower = _.filter(Game.creeps, c => c.memory.role == "burrower" && c.memory.room == rmHarvest && (c.ticksToLive == undefined || c.ticksToLive > 160));
        let lCarrier = _.filter(Game.creeps, c => c.memory.role == "carrier" && c.memory.room == rmHarvest && (c.ticksToLive == undefined || c.ticksToLive > 160));
        let lMiner = _.filter(Game.creeps, c => c.memory.role == "miner" && c.memory.room == rmHarvest && (c.ticksToLive == undefined || c.ticksToLive > 160));
        let lMultirole = _.filter(Game.creeps, c => c.memory.role == "multirole" && c.memory.room == rmHarvest);
        let lReserver = _.filter(Game.creeps, c => c.memory.role == "reserver" && c.memory.room == rmHarvest);
        let lExtractor = _.filter(Game.creeps, c => c.memory.role == "extractor" && c.memory.room == rmHarvest);

        let popTarget =
              (listPopulation["paladin"] == null ? 0 : listPopulation["paladin"]["amount"])
			+ (listPopulation["healer"] == null ? 0 : listPopulation["healer"]["amount"])
			+ (listPopulation["burrower"] == null ? 0 : listPopulation["burrower"]["amount"])
            + (listPopulation["carrier"] == null ? 0 : listPopulation["carrier"]["amount"])
            + (listPopulation["miner"] == null ? 0 : listPopulation["miner"]["amount"])
            + (listPopulation["multirole"] == null ? 0 : listPopulation["multirole"]["amount"])
            + (listPopulation["reserver"] == null ? 0 : listPopulation["reserver"]["amount"])
            + (listPopulation["extractor"] == null ? 0 : listPopulation["extractor"]["amount"]);
        let popActual = lPaladin.length + lHealer.length + lBurrower.length + lCarrier.length + lMiner.length + lMultirole.length + lReserver.length + lExtractor.length;
        Hive.populationTally(rmColony, popTarget, popActual);

        if (listPopulation["paladin"] != null && lPaladin.length < listPopulation["paladin"]["amount"]) {
			Memory["spawn_requests"].push({ room: rmColony, distance: 0, priority: 1, level: listPopulation["paladin"]["level"], 
				scale_level: listPopulation["paladin"]["scale_level"],
				body: "paladin", name: null, args: {role: "paladin", room: rmHarvest, colony: rmColony} });
		} else if (hasKeepers == false && Object.keys(Game.rooms).includes(rmHarvest) && Game.rooms[rmHarvest].find(FIND_HOSTILE_CREEPS, 
                        {filter: (c) => { return Memory["allies"].indexOf(c.owner.username) < 0; }}).length > 0) {
            let lSoldier = _.filter(Game.creeps, (creep) => creep.memory.role == "soldier" && creep.memory.room == rmHarvest);
            if (lSoldier.length + lMultirole.length < Game.rooms[rmHarvest].find(FIND_HOSTILE_CREEPS, 
                        {filter: (c) => { return Memory["allies"].indexOf(c.owner.username) < 0; }}).length) {
				Memory["spawn_requests"].push({ room: rmColony, distance: 0, priority: 0, level: 8, 
					body: "soldier", name: null, args: {role: "soldier", room: rmHarvest, colony: rmColony} });				
            }
        }
		else if (listPopulation["healer"] != null && lHealer.length < listPopulation["healer"]["amount"]) {            
			Memory["spawn_requests"].push({ room: rmColony, distance: spawnDistance, priority: 1, level: listPopulation["healer"]["level"], 
					body: "healer", name: null, args: {role: "healer", room: rmHarvest, colony: rmColony} });				
        }
        else if (listPopulation["miner"] != null && lMiner.length < listPopulation["miner"]["amount"]) {
            if (lMiner.length == 0) { // Possibly colony wiped? Need restart?                
				Memory["spawn_requests"].push({ room: rmColony, distance: 0, priority: 1, level: 1, 
					body: "worker", name: null, args: {role: "miner", room: rmHarvest, colony: rmColony} });			
			} else {            				
				Memory["spawn_requests"].push({ room: rmColony, distance: spawnDistance, priority: 1, level: listPopulation["miner"]["level"], 
					body: "worker", name: null, args: {role: "miner", room: rmHarvest, colony: rmColony} });
            }    
        }
        else if (listPopulation["burrower"] != null && lBurrower.length < listPopulation["burrower"]["amount"]) {
            if (lCarrier.length == 0 && listPopulation["carrier"] != null && lMiner.length == 0) {// Possibly colony wiped? Need restart?                
				Memory["spawn_requests"].push({ room: rmColony, distance: 0, priority: 1, level: 1, 
					body: "worker", name: null, args: {role: "miner", room: rmHarvest, colony: rmColony} });			
            } else {                
				Memory["spawn_requests"].push({ room: rmColony, distance: spawnDistance, priority: 1, level: listPopulation["burrower"]["level"], 
					body: "burrower", name: null, args: {role: "burrower", room: rmHarvest, colony: rmColony} });
            }
        }
        else if (listPopulation["carrier"] != null && lCarrier.length < listPopulation["carrier"]["amount"]) {
            if (listPopulation["carrier"]["body"] == null) {                
				Memory["spawn_requests"].push({ room: rmColony, distance: spawnDistance, priority: 1, level: listPopulation["carrier"]["level"], 
					body: "carrier", name: null, args: {role: "carrier", room: rmHarvest, colony: rmColony} });
            } else if (listPopulation["carrier"]["body"] == "all-terrain") {                
				Memory["spawn_requests"].push({ room: rmColony, distance: spawnDistance, priority: 1, level: listPopulation["carrier"]["level"], 
					body: "carrier_at", name: null, args: {role: "carrier", room: rmHarvest, colony: rmColony} });
            }
        }
        else if (listPopulation["multirole"] != null && lMultirole.length < listPopulation["multirole"]["amount"]) {
            Memory["spawn_requests"].push({ room: rmColony, distance: spawnDistance, priority: 2, level: listPopulation["multirole"]["level"], 
				body: (hasKeepers == false ? "multirole" : "worker"), name: null, args: {role: "multirole", room: rmHarvest, colony: rmColony} });
        }
        else if (listPopulation["reserver"] != null && lReserver.length < listPopulation["reserver"]["amount"] 
                    && Game.rooms[rmHarvest] != null && Game.rooms[rmHarvest].controller != null
                    && (Game.rooms[rmHarvest].controller.reservation == null || Game.rooms[rmHarvest].controller.reservation.ticksToEnd < 2000)) {                    
			Memory["spawn_requests"].push({ room: rmColony, distance: 0, priority: 2, level: listPopulation["reserver"]["level"], 
				body: "reserver", name: null, args: {role: "reserver", room: rmHarvest, colony: rmColony} });
        }
        else if (listPopulation["extractor"] != null && lExtractor.length < listPopulation["extractor"]["amount"] 
                    && Object.keys(Game.rooms).includes(rmHarvest)
                    && Game["rooms"][rmHarvest].find(FIND_MINERALS, {filter: (m) => { return m.mineralAmount > 0; }}).length > 0) {            
			Memory["spawn_requests"].push({ room: rmColony, distance: spawnDistance, priority: 1, level: listPopulation["extractor"]["level"], 
					body: "extractor", name: null, args: {role: "extractor", room: rmHarvest, colony: rmColony} });
        }
	},
	
	
	runCreeps: function(rmColony, rmHarvest, hasKeepers, listRoute) {
		let Roles = require("roles");
		
		let isSafe = !Object.keys(Game.rooms).includes(rmHarvest) || rmColony == rmHarvest 
					|| Game.rooms[rmHarvest].find(FIND_HOSTILE_CREEPS, { filter: (c) => 
						{ return Memory["allies"].indexOf(c.owner.username) < 0; }}).length == 0;
		
        for (let n in Game.creeps) {
            let creep = Game.creeps[n];                
            if (creep.memory.room != null && creep.memory.colony != null 
                    && creep.memory.room == rmHarvest && creep.memory.colony == rmColony) {
                
				creep.memory.listRoute = listRoute;
                
				if (hasKeepers == false) {
					if (isSafe == true) {
						if (creep.memory.role == "miner" || creep.memory.role == "burrower" || creep.memory.role == "carrier") {
							Roles.Mining(creep);
						} else if (creep.memory.role == "multirole") {
							Roles.Worker(creep);
						} else if (creep.memory.role == "reserver") {
							Roles.Reserver(creep);
						} else if (creep.memory.role == "extractor") {
							Roles.Extracter(creep);
						} else if (creep.memory.role == "healer") {
							Roles.Healer(creep);
						}
					} else {
						if (creep.memory.role == "soldier" || creep.memory.role == "multirole") {
							Roles.Soldier(creep);
						} else if (creep.memory.role == "healer") {
							Roles.Healer(creep);
						}
					}
				} else if (hasKeepers == true) {
					if (creep.memory.role == "miner" || creep.memory.role == "burrower" || creep.memory.role == "carrier") {
						Roles.Mining(creep, true);
					} else if (creep.memory.role == "multirole") {
						Roles.Worker(creep, true);					
					} else if (creep.memory.role == "extractor") {
						Roles.Extracter(creep, true);
					} else if (creep.memory.role == "soldier" || creep.memory.role == "paladin") {
						Roles.Soldier(creep, false);
					} else if (creep.memory.role == "healer") {
							Roles.Healer(creep);
					}
				}
            }
        } 
	}
};