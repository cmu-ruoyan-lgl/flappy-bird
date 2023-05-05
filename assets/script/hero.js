cc.Class({
    extends: cc.Component,

    properties: {
        hit:cc.AudioClip,
        die:cc.AudioClip,
        swoosh:cc.AudioClip,
    },

    onLoad () {
        this.time = 0
        this.fall = true // 是否可以落下
    },

    onCollisionEnter(other, self) {
        if(game.gameType == 3) return
        // 碰管道
        if(other.tag == 0){
            game.gameType = 3
            this.playSound()
            this.node.stopAllActions()
            const fallTime = (this.node.y + 255) / 650
            const act_1 = cc.delayTime(0.2)
            const act_2 = cc.moveTo(fallTime,cc.v2(this.node.x,-255))
            const act_3 = cc.rotateTo(fallTime,-90)
            const act_4 = cc.spawn(act_2,act_3)
            const end = cc.sequence(act_1,act_4)
            this.node.runAction(end)

            this.scheduleOnce(function(){
                game.gameOverCheck()
            },0.5)
        }
    },

    playSound(){
        cc.audioEngine.play(this.hit, false, 1)
        this.scheduleOnce(function(){
            cc.audioEngine.play(this.die, false, 1)
        },0.2)
        this.scheduleOnce(function(){
            cc.audioEngine.play(this.swoosh, false, 1)
        },0.6)
    },

    setRotation(type){
        this.node.stopActionByTag(1)
        if(type == 'up'){
            this.node.rotation = -20
        }else if(type == 'down'){
            const act_1 = cc.rotateTo(0.6,-80)
            act_1.setTag(1)
            this.node.runAction(act_1)
        }
    },

    update(dt) {
        if(game.gameType != 2) return
        if(this.fall == false) return
        this.time++
        this.node.y = this.node.y - 100*dt - this.time*8 * dt
        // 小鸟碰到了地面
        if(this.node.y <= -255){
            game.gameType = 3
            this.playSound()
            this.scheduleOnce(function(){
                game.gameOverCheck()
            },0.3)
        }
    },
});
