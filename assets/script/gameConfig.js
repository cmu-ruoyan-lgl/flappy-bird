var gameData = {
    // game 
    beginSpeed: 2,
    maxSpeed: 4,
    upSpeedRate: 0.02,

    // title
    titlePosX: 0,
    titlePosY: 305,

    // rank 
    rankInfoGap: 4,

    // land
    firBlockX: 360,
    landTopY: -255,

    // block
    maxBlockY: 260,
    minBlockY: -95,
    betweenX: 220,
    blockEnterMaxHeight: 380,
    blockEnterMinHeight: 360,
    blockEnterChangeRate: 0.2,

    // birdNode
    fallAcceleration: 8,
    fallEternalRate: 100,
    birdNodePosX: -140,
    birdNodePosY: 75,
    dieFallRate: 650,
}

var gameType = {
    begin: 0,
    ready: 1,
    playing: 2,
    over: 3,
}

exports.gameData = gameData
exports.gameType = gameType