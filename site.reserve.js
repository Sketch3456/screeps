var rolesMining = require('roles.mining');

var utilHive = require('util.hive');

var siteReserve = {

    run: function(rmColony, rmHarvest, tgtLevel, popReserver) {

        var lReserver  = _.filter(Game.creeps, (c) => c.memory.role == 'reserver' && c.memory.room == rmHarvest && (c.ticksToLive == undefined || c.ticksToLive > 80));
        
        var popTarget = popReserver;
        var popActual = lReserver.length;
        utilHive.populationTally(rmColony, popTarget, popActual);

        // Defend the mining op!
        if (lReserver.length < popReserver) {
            utilHive.requestSpawn(rmColony, 0, 2, tgtLevel, 'reserver', null, {role: 'reserver', room: rmHarvest});            
        }

        // Run roles!
        for (var n in Game.creeps) {
            var creep = Game.creeps[n];
                
            if (creep.memory.room != null && creep.memory.room == rmHarvest) {                
                if (creep.memory.role == 'reserver') {
                    rolesMining.Reserve(creep);
                } 
            }            
        }
    }
};

module.exports = siteReserve;