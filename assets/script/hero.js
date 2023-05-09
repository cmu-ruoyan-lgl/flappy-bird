import { gameData, gameType } from './gameConfig'
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
        this.canFall = true
    },

    onCollisionEnter(other, self) {
        if (game.gameType === gameType.over) return
        if (other.tag === 0) {
            this.gameOver(0.55)

            this.node.stopAllActions()
            const fallTime = (this.node.y - gameData.landTopY) / gameData.dieFallRate
            const act_1 = cc.delayTime(0.2)
            const act_2 = cc.moveTo(fallTime, cc.v2(this.node.x, gameData.landTopY))
            const act_3 = cc.rotateTo(fallTime, -90)
            const act_4 = cc.spawn(act_2, act_3)
            const end = cc.sequence(act_1, act_4)
            this.node.runAction(end)
        }
    },

    playSound() {
        cc.audioEngine.play(this.hit, false, 1)
        this.scheduleOnce(() => {
            cc.audioEngine.play(this.die, false, 1)
        }, 0.2)
        this.scheduleOnce(() => {
            cc.audioEngine.play(this.swoosh, false, 1)
        }, 0.2)
    },

    setRotation(type) {
        const actTag_1 = 1
        this.node.stopActionByTag(actTag_1)
        if (type === 'up') {
            this.node.angle = 20
        } else if (type === 'down') {
            const act_1 = cc.rotateTo(0.6, -80)
            act_1.setTag(actTag_1)
            this.node.runAction(act_1)
        }
    },

    jump() {
        const actTag_2 = 2
        cc.audioEngine.play(this.wing, false, 1)
        this.node.stopActionByTag(actTag_2)
        this.canFall = false
        this.time = 0
        this.setRotation('up')
        const act_1 = cc.moveBy(0.3, cc.v2(0, 80)).easing(cc.easeCubicActionOut())
        const act_2 = cc.callFunc(() => {
            this.canFall = true
            this.setRotation('down')
        })
        const end = cc.sequence(act_1, act_2)
        end.setTag(actTag_2)
        this.node.runAction(end)
    },

    gameOver(dlt) {
        game.gameType = gameType.over
        this.playSound()
        this.scheduleOnce(() => {
            game.shouldShowPlayerNameInput()
        }, dlt)
    },

    update(dt) {
        if (game.gameType !== gameType.playing) return
        if (this.canFall === false) return
        this.time++
        this.node.y = this.node.y - gameData.fallEternalRate * dt - this.time * gameData.fallAcceleration * dt
        if (this.node.y <= gameData.landTopY) {
            this.gameOver(0.3)
        }
    },
});
