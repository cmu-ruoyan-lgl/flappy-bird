import {gameData} from './gameConfig'
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
        hero: cc.Node,
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

    onLoad() {
        // cc.sys.localStorage.removeItem('rank_score')
        window.game = this
        this.getName = ""
        this.gameOver.active = false
        this.hero.active = true
        // 开启碰撞检测系统，未开启时无法检测
        cc.director.getCollisionManager().enabled = true
        // 0:gameBegin 1:gameReady 2:gamePlaying 3:gameOver
        if (cc.director.getScene().name === "begin") {
            this.gameType = 0
            this.gameBegin.active = true
            this.gameReady.active = false
            this.scrollView.active = false
        } else {
            this.gameType = 1
            this.gameBegin.active = false
            this.gameReady.active = true
        }
    
        this.actTitle()
        this.actHero()
        this.actLabel()
        this.setTouch()
   
        // 当前分数
        this.score = 0
        this.numBlock = 0
        this.scoreCurrentPlay.string = 0
        // 地面位置初始化
        this.land_1.x = 0
        this.land_2.x = this.land_1.x + this.land_1.width     
        // 对象池技术
        this.blockPool = new cc.NodePool()
        this.bird = this.hero.getComponent('hero')

        // 下面从gameConfig中初始化的变量
        this.rankInfoGap = gameData.rankInfoGap
        this.firBlockX = gameData.firBlockX
        // 两个管道之间的距离
        this.betweenX = gameData.betweenX
        // 单一管道的位置
        this.maxBlockY = gameData.maxBlockY
        this.minBlockY = gameData.minBlockY
    },

    setTouch() {
        this.node.on('touchend', function (event) {
            if (this.gameType === 1) {
                this.gameType = 2
                this.ready.active = false
                this.hero.stopActionByTag(3)
            }
            if (this.gameType === 2) {
                this.bird.jump()
            }
        }, this)
    },

    shouldShowPlayerNameInput() {
        const scoreData = cc.sys.localStorage.getItem('rank_score')
        const classBestScoreArray = JSON.parse(scoreData)
        let oldScoreBest = null
        if (classBestScoreArray !== null) {
            oldScoreBest = classBestScoreArray[0].score
        }
        if (oldScoreBest !== null && this.score <= oldScoreBest) {
            this.saveGameData()
        } else {
            this.gameReady.active = false
            this.nameInput.active = true
        }
    },

    saveGameData() {
        this.gameReady.active = false
        this.nameInput.active = false
        this.gameOver.active = true
        this.scoreCurrentOver.string = this.score
        this.scoreBestOver.string = this.score

        // 读数据
        const scoreData = cc.sys.localStorage.getItem('rank_score')
        let classBestScoreArray = JSON.parse(scoreData)

        let oldScoreBest = 0
        if (classBestScoreArray !== null) {
            oldScoreBest = classBestScoreArray[0].score
        }
        let playerName = ""
        if (this.getName !== "")
            playerName = this.getName
        if (!classBestScoreArray) {
            classBestScoreArray = []
            const gameScoreNow = { name: playerName, score: this.score }
            classBestScoreArray.unshift(gameScoreNow)
        } else if (this.score > oldScoreBest) {
            // const isSame = classBestScoreArray.some(num => num.name === playerName)
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
                // sort 按照得分从大到小
                classBestScoreArray = Array.from(classBestScoreArray).sort((a, b) => b.score - a.score)
            } else {
                const gameScoreNow = { name: playerName, score: this.score }
                classBestScoreArray.unshift(gameScoreNow)
            }
        } else if (this.score < oldScoreBest) {
            this.scoreBestOver.string = oldScoreBest
        }
        const baseData = JSON.stringify(classBestScoreArray)
        cc.sys.localStorage.setItem('rank_score', baseData)
    },

    createBlock(pos) {
        let block = null
        // 通过 size 接口判断对象池中是否有空闲的对象
        if (this.blockPool.size() > 0) {
            block = this.blockPool.get()
        } else {
            // 对象池中备用对象不够
            block = cc.instantiate(this.preBlock)
        }
        block.parent = this.blockParent
        // block.getComponent('block').init()
        block.setPosition(pos)
    },

    createRankInfo() {
        let rankInfo = null
        const scoreData = cc.sys.localStorage.getItem('rank_score')
        const classBestScoreArray = JSON.parse(scoreData)
        if (classBestScoreArray === null) return
        const classBestScoreArrayLen = classBestScoreArray.length
        for (let i = 0; i < classBestScoreArrayLen; i++) {
            rankInfo = cc.instantiate(this.preRankInfo)
            rankInfo.setPosition(cc.v2(0, -i * (rankInfo.height + this.rankInfoGap) - rankInfo.height / 2))
            rankInfo.getComponent('rank').init(i + 1, classBestScoreArray[i].name, classBestScoreArray[i].score)
            rankInfo.parent = this.rankInfoParent
        }
        this.rankInfoParent.height = classBestScoreArray.length * (rankInfo.height + this.rankInfoGap)
    },

    // 将管道放回对象池
    onBlockKilled(block) {
        // 和初始化时的方法一样，将节点放进对象池，这个方法会同时调用节点的 removeFromParent
        this.numBlock--
        this.blockPool.put(block)
    },

    // 判断是否应该添加管道
    shouldGenerateBlock() {
        if (this.numBlock === 0) {
            this.createBlock(cc.v2(this.firBlockX, Math.random() * (this.maxBlockY - this.minBlockY) + this.minBlockY))
            this.numBlock++
        }

        if (this.numBlock < 5) {
            const lastBlockX = this.blockParent.children[this.blockParent.children.length - 1].x
            this.createBlock(cc.v2(lastBlockX + this.betweenX, Math.random() * (this.maxBlockY - this.minBlockY) + this.minBlockY))
            this.numBlock++
        }
    },

    // gameBegin title上下移动的动作
    actTitle() {
        const act_1 = cc.moveBy(0.4, cc.v2(0, 10))
        const act_2 = cc.moveBy(0.8, cc.v2(0, -20))
        const act_3 = cc.moveBy(0.4, cc.v2(0, 10))

        const act_4 = cc.sequence(act_1, act_2, act_3)
        const act_5 = cc.repeatForever(act_4)
        this.title.runAction(act_5)
    },

    // bird移动
    actHero() {
        const act_1 = cc.moveBy(0.4, cc.v2(0, 10))
        const act_2 = cc.moveBy(0.8, cc.v2(0, -20))
        const act_3 = cc.moveBy(0.4, cc.v2(0, 10))

        const act_4 = cc.sequence(act_1, act_2, act_3)
        const act_5 = cc.repeatForever(act_4)
        act_5.setTag(3)
        this.hero.runAction(act_5)
    },

    // gameReady移动
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

    // 地面轮播
    runLand() {
        if (this.gameType === 3) return
        this.land_1.x = this.land_1.x - 3
        this.land_2.x = this.land_2.x - 3
        if (this.land_1.x <= -this.land_1.width) {
            this.land_1.x = this.land_2.x + this.land_1.width
        }
        if (this.land_2.x <= -this.land_2.width) {
            this.land_2.x = this.land_1.x + this.land_1.width
        }
    },

    clickBtn(sender, str) {
        if (str === 'btnPlay') {
            if (cc.director.getScene().name !== "game") {
                cc.director.loadScene("game")
            }
        } else if (str === 'btnOver') {
            this.cleanAllBlocks()
            this.gameOver.active = false
            this.gameReady.active = true
            this.score = 0        
            this.numBlock = 0
            this.firBlockX = 360
            this.hero.stopAllActions()
            this.hero.angle = 0
            this.hero.setPosition(cc.v2(-140, 85))
            this.ready.active = true
            this.actHero()
            this.actLabel()
            this.gameType = 1
            this.scoreCurrentPlay.string = 0
        } else if (str === 'btnRank') {
            this.gameBegin.active = false
            this.scrollView.active = true
            this.createRankInfo()
        } else if (str === 'btnReturnMain') {
            cc.director.loadScene("begin") // todo
        } else if (str === 'btnPush') {
            this.getName = this.playerNameEditBox.string
            this.saveGameData()
        }
    },

    // 移除所有管道
    cleanAllBlocks() {
        const children = this.blockParent.children
        for (let i = children.length - 1; i >= 0; i--) {
            this.onBlockKilled(children[i])
        }
    },

    update(dt) {
        this.runLand()
        if (this.gameType !== 2) return
        // 判断是否该生成新管子
        this.shouldGenerateBlock()
        // 更新界面的显示得分
        this.scoreCurrentPlay.string = this.score
    },
});
