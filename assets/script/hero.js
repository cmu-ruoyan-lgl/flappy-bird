import { gameData } from './gameConfig'
cc.Class({
    extends: cc.Component,

    properties: {
        hit: cc.AudioClip,
        die: cc.AudioClip,
        swoosh: cc.AudioClip,
        wing: cc.AudioClip,
    },

    onLoad() {
        this.time = 0
        // 是否可以落下
        this.fall = true
        this.landTopY = gameData.landTopY
        this.fallAcceleration = gameData.fallAcceleration
        this.fallEternalRate = gameData.fallEternalRate
        this.dieFallRate = gameData.dieFallRate
    },

    onCollisionEnter(other, self) {
        if (game.gameType === "gameOver") return
        // 碰管道
        if (other.tag === 0) {
            game.gameType = "gameOver"
            this.playSound()
            this.node.stopAllActions()
            const fallTime = (this.node.y - this.landTopY) / this.dieFallRate
            const act_1 = cc.delayTime(0.2)
            const act_2 = cc.moveTo(fallTime, cc.v2(this.node.x, this.landTopY))
            const act_3 = cc.rotateTo(fallTime, -90)
            const act_4 = cc.spawn(act_2, act_3)
            const end = cc.sequence(act_1, act_4)
            this.node.runAction(end)

            this.scheduleOnce(function () {
                game.shouldShowPlayerNameInput()
            }, 0.5)
        }
    },

    playSound() {
        cc.audioEngine.play(this.hit, false, 1)
        this.scheduleOnce(function () {
            cc.audioEngine.play(this.die, false, 1)
        }, 0.2)
        this.scheduleOnce(function () {
            cc.audioEngine.play(this.swoosh, false, 1)
        }, 0.2)
    },

    setRotation(type) {
        this.node.stopActionByTag(1)
        if (type === 'up') {
            this.node.angle = 20
        } else if (type === 'down') {
            const act_1 = cc.rotateTo(0.6, -80)
            act_1.setTag(1)
            this.node.runAction(act_1)
        }
    },

    jump() {
        cc.audioEngine.play(this.wing, false, 1)
        this.node.stopActionByTag(2)
        this.fall = false
        this.time = 0
        this.setRotation('up')
        const act_1 = cc.moveBy(0.3, cc.v2(0, 80)).easing(cc.easeCubicActionOut())
        const act_2 = cc.callFunc(function () {
            this.fall = true
            this.setRotation('down')
        }.bind(this))
        const end = cc.sequence(act_1, act_2)
        end.setTag(2)
        this.node.runAction(end)
    },

    update(dt) {
        if (game.gameType !== "gamePlaying") return
        if (this.fall === false) return
        this.time++
        this.node.y = this.node.y - this.fallEternalRate * dt - this.time * this.fallAcceleration * dt
        // 小鸟碰到了地面
        if (this.node.y <= this.landTopY) {
            game.gameType = "gameOver"
            this.playSound()
            this.scheduleOnce(function () {
                game.shouldShowPlayerNameInput()
            }, 0.3)
        }
    },
});
