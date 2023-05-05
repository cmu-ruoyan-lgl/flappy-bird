cc.Class({
    extends: cc.Component,

    properties: {
        blockUp:cc.Node,
        blockDown:cc.Node,
    },

    onLoad () {
        this.beginSpeed = 2
        this.maxSpeed = 4
        this.upSpeedRate = 50
    },

    init:function(){
        // 是否可以增加分数
        this.canScore = true 
        const blockY = 380 - game.numScore / 5
        if(blockY < 360){
            blockY = 360
        }
        this.blockUp.y = blockY * (-1)
        this.blockDown.y = blockY
    },

    update (dt) {
        let spendX = this.beginSpeed + game.numScore / this.upSpeedRate
        if(spendX > this.maxSpeed){
            spendX = this.maxSpeed
        }
        if(game.gameType != 2) return
        this.node.x = this.node.x - spendX
        if(this.node.x < -350){
            game.onBlockKilled(this.node)
        }
    },
});
