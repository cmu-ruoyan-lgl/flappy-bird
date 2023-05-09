import { gameData, gameType } from './gameConfig'
cc.Class({
    extends: cc.Component,

    properties: {
        land_1: cc.Node,
        land_2: cc.Node,
        title: cc.Node,
        gameBegin: cc.Node,
        gameReady: cc.Node,
        gameOver: cc.Node,
        scrollView: cc.Node,
        birdNode: cc.Node,
        labPlay: cc.Node,
        ready: cc.Node,
        preBlock: cc.Prefab,
        preRankInfo: cc.Prefab,
        blockParent: cc.Node,
        rankInfoParent: cc.Node,
        scoreCurrentPlay: cc.Label,
        scoreCurrentOver: cc.Label,
        scoreBestOver: cc.Label,
        playerNameEditBox: cc.EditBox,
        nameInput: cc.Node,
        wing: cc.AudioClip,
        coin: cc.AudioClip,
    },

    init(){
        window.game = this
        this.speedX = gameData.beginSpeed
        this.birdNode.active = true
        this.blockPool = new cc.NodePool()
        this.bird = this.birdNode.getComponent('hero')
        cc.director.getCollisionManager().enabled = true
    },

    reset(){
        this.gameType = gameType.begin
        this.gameBegin.active = true
        this.gameReady.active = false
        this.gameOver.active = false
        this.scrollView.active = false
        this.nameInput.active = false

        this.rankInfoParent.removeAllChildren()
        this.title.stopAllActions()
        this.birdNode.stopAllActions()
        this.cleanAllBlocks()
        this.actTitle()
        this.actHero()
        this.actLabel()
        this.setTouch()

        this.score = 0
        this.numBlock = 0
        this.land_1.x = 0
        this.land_2.x = this.land_1.x + this.land_1.width
        this.scoreCurrentPlay.string = 0
        this.birdNode.setPosition(cc.v2(gameData.birdNodePosX, gameData.birdNodePosY))
        this.title.setPosition(cc.v2(gameData.titlePosX, gameData.titlePosY))
        this.birdNode.angle = 0
        this.getName = ""
    },

    onLoad() {
        this.init()
        this.reset()
        // cc.sys.localStorage.removeItem('rank_score')
    },

    getStorageData(dataName) {
        try {
            const jsonData = JSON.parse(cc.sys.localStorage.getItem(dataName))
            return jsonData
        } catch (e) {
            return null
        }
    },

    setTouch() {
        this.node.on('touchend', function (event) {
            if (this.gameType === gameType.ready) {
                this.gameType = gameType.playing
                this.ready.active = false
                this.bird.jump()
                this.birdNode.stopActionByTag(3)
            } else if (this.gameType === gameType.playing) {
                this.bird.jump()
            }
        }, this)
    },

    shouldShowPlayerNameInput() {
        const classBestScoreArray = this.getStorageData('rank_score')
        let oldScoreBest = -1
        if (classBestScoreArray !== null) {
            oldScoreBest = classBestScoreArray[0].score
        }
        this.scoreCurrentOver.string = this.score
        if (this.score <= oldScoreBest) {
            this.scoreBestOver.string = oldScoreBest
            this.ShowGameOver()
        } else {
            this.scoreBestOver.string = this.score
            this.gameReady.active = false
            this.nameInput.active = true
        }
    },

    ShowGameOver() {
        this.gameReady.active = false
        this.nameInput.active = false
        this.gameOver.active = true
    },

    saveGameData() {
        let classBestScoreArray = this.getStorageData('rank_score')
        let oldScoreBest = 0
        if (classBestScoreArray !== null) {
            oldScoreBest = classBestScoreArray[0].score
        }
        let playerName = ""
        if (this.getName !== "")
            playerName = this.getName
        if (!classBestScoreArray) {
            classBestScoreArray = [{ name: playerName, score: this.score }]
        } else if (this.score > oldScoreBest) {
            let isSame = false
            const classBestScoreArrayLen = classBestScoreArray.length
            for (let i = 0; i < classBestScoreArrayLen; i++) {
                if (classBestScoreArray[i].name === playerName) {
                    classBestScoreArray[i].score = this.score
                    isSame = true
                    break
                }
            }
            if (isSame) {
                classBestScoreArray = Array.from(classBestScoreArray).sort((a, b) => b.score - a.score)
            } else {
                classBestScoreArray.unshift({ name: playerName, score: this.score })
            }
        } 
        const baseData = JSON.stringify(classBestScoreArray)
        cc.sys.localStorage.setItem('rank_score', baseData)
    },

    createBlock(pos) {
        let block = null
        if (this.blockPool.size() > 0) {
            block = this.blockPool.get()
        } else {
            block = cc.instantiate(this.preBlock)
        }
        block.parent = this.blockParent
        this.numBlock++
        block.setPosition(pos)
    },

    createRankInfo() {
        const classBestScoreArray = this.getStorageData('rank_score')
        if (classBestScoreArray === null) return

        let rankInfo = null
        const classBestScoreArrayLen = classBestScoreArray.length
        for (let i = 0; i < classBestScoreArrayLen; i++) {
            rankInfo = cc.instantiate(this.preRankInfo)
            rankInfo.setPosition(cc.v2(0, -i * (rankInfo.height + gameData.rankInfoGap) - rankInfo.height / 2))
            rankInfo.getComponent('rank').init(i + 1, classBestScoreArray[i].name, classBestScoreArray[i].score)
            rankInfo.parent = this.rankInfoParent
        }
        this.rankInfoParent.height = classBestScoreArray.length * (rankInfo.height + gameData.rankInfoGap)
    },

    onBlockKilled(block) {
        this.numBlock--
        this.blockPool.put(block)
    },

    shouldGenerateBlock() {
        if (this.numBlock === 0) {
            this.createBlock(cc.v2(gameData.firBlockX, Math.random() * (gameData.maxBlockY - gameData.minBlockY) + gameData.minBlockY))
        }
        if (this.numBlock < 5) {
            const lastBlockX = this.blockParent.children[this.blockParent.children.length - 1].x
            this.createBlock(cc.v2(lastBlockX + gameData.betweenX, Math.random() * (gameData.maxBlockY - gameData.minBlockY) + gameData.minBlockY))
        }
    },

    actTitle() {
        const act_1 = cc.moveBy(0.4, cc.v2(0, 10))
        const act_2 = cc.moveBy(0.8, cc.v2(0, -20))
        const act_3 = cc.moveBy(0.4, cc.v2(0, 10))
        const act_4 = cc.sequence(act_1, act_2, act_3)
        const act_5 = cc.repeatForever(act_4)
        this.title.runAction(act_5)
    },

    actHero() {
        const act_1 = cc.moveBy(0.4, cc.v2(0, 10))
        const act_2 = cc.moveBy(0.8, cc.v2(0, -20))
        const act_3 = cc.moveBy(0.4, cc.v2(0, 10))
        const act_4 = cc.sequence(act_1, act_2, act_3)
        const act_5 = cc.repeatForever(act_4)
        act_5.setTag(3)
        this.birdNode.runAction(act_5)
    },

    actLabel() {
        this.labPlay.stopAllActions()
        this.labPlay.angle = 0
        const act_1 = cc.rotateBy(0.5, 10)
        const act_2 = cc.rotateBy(1, -20)
        const act_3 = cc.rotateBy(0.5, 10)
        const act_4 = cc.sequence(act_1, act_2, act_3)
        const act_5 = cc.repeatForever(act_4)
        this.labPlay.runAction(act_5)
    },

    runLand() {
        if (this.gameType === gameType.over) return
        this.land_1.x = this.land_1.x - this.speedX
        this.land_2.x = this.land_2.x - this.speedX
        if (this.land_1.x <= -this.land_1.width) {
            this.land_1.x = this.land_2.x + this.land_1.width
        }
        if (this.land_2.x <= -this.land_2.width) {
            this.land_2.x = this.land_1.x + this.land_1.width
        }
    },

    clickBtn(sender, str) {
        if (str === 'btnPlay') {
            this.reset()
            this.gameBegin.active = false
            this.ready.active = true
            this.gameReady.active = true
            this.gameType = gameType.ready

            this.birdNode.stopAllActions()
            this.birdNode.angle = 0
            this.birdNode.setPosition(cc.v2(gameData.birdNodePosX, gameData.birdNodePosY))
            this.actHero()
        } else if (str === 'btnRank') {
            this.gameBegin.active = false
            this.scrollView.active = true
            this.createRankInfo()
        } else if (str === 'btnReturnMain') {
            this.reset()
        } else if (str === 'btnPush') {
            this.getName = this.playerNameEditBox.string
            this.saveGameData()
            this.ShowGameOver()
        }
    },

    cleanAllBlocks() {
        const children = this.blockParent.children
        for (let i = children.length - 1; i >= 0; i--) {
            this.onBlockKilled(children[i])
        }
    },

    updateSpeedX() {
        this.speedX = gameData.beginSpeed + this.score * gameData.upSpeedRate
        this.speedX = Math.min(this.speedX, gameData.maxSpeed)
    },

    update(dt) {
        this.updateSpeedX()
        this.runLand()
        if (this.gameType !== gameType.playing) return
        this.shouldGenerateBlock()
        this.scoreCurrentPlay.string = this.score
    },
});
