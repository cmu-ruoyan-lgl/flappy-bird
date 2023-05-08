import { gameData } from './gameConfig'
cc.Class({
    extends: cc.Component,

    properties: {
        blockUp: cc.Node,
        blockDown: cc.Node,
    },

    onLoad() {
        this.birdX = game.hero.x
        this.beginSpeed = gameData.beginSpeed
        this.maxSpeed = gameData.maxSpeed
        this.upSpeedRate = gameData.upSpeedRate
        this.blockEnterMaxHeight = gameData.blockEnterMaxHeight
        this.blockEnterMinHeight = gameData.blockEnterMinHeight
        this.blockEnterChangeRate = gameData.blockEnterChangeRate
    },

    onEnable() {
        this.canScore = true
        const blockY = this.blockEnterMaxHeight - game.score * this.blockEnterChangeRate
        if (blockY < this.blockEnterMinHeight) {
            blockY = this.blockEnterMinHeight
        }
        this.blockUp.y = blockY * (-1)
        this.blockDown.y = blockY
    },

    update(dt) {
        let speedX = this.beginSpeed + game.score * this.upSpeedRate
        if (speedX > this.maxSpeed) {
            speedX = this.maxSpeed
        }
        if (game.gameType !== "gamePlaying") return
        this.node.x = this.node.x - speedX

        if (this.node.x < (this.birdX - 25) && this.canScore) {
            this.canScore = false
            game.score++
        }
        if (this.node.x < -350) {
            game.onBlockKilled(this.node)
        }
    },
});
