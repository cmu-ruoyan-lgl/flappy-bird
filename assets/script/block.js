import { gameData, gameType } from './gameConfig'
cc.Class({
    extends: cc.Component,

    properties: {
        blockUp: cc.Node,
        blockDown: cc.Node,
    },

    onLoad() {
        this.birdX = game.birdNode.x
    },

    onEnable() {
        this.canScore = true
        let blockY = gameData.blockEnterMaxHeight - game.score * gameData.blockEnterChangeRate
        blockY = Math.max(blockY, gameData.blockEnterMinHeight)
        this.blockUp.y = blockY * (-1)
        this.blockDown.y = blockY
    },

    update(dt) {
        if (game.gameType !== gameType.playing) return
        this.node.x = this.node.x - game.speedX
        if (this.node.x < (this.birdX - 25) && this.canScore) {
            this.canScore = false
            game.score++
        }
        if (this.node.x < -350) {
            game.onBlockKilled(this.node)
        }
    },
});
