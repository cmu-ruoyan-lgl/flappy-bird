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
        nameInput:cc.Node,

        wing: cc.AudioClip,
        coin: cc.AudioClip,
    },

    onLoad() {
        // cc.sys.localStorage.removeItem('rank_score')
        this.getName = ""
        window.game = this
        this.land_1.x = 0
        this.land_2.x = this.land_1.x + this.land_1.width
        this.rankInfoGap = 4
        this.actTitle()
        this.actHero()
        this.actLabel()

        if(cc.director.getScene().name === "begin") {
            // 0:gameBegin 1:gameReady 2:gamePlaying 3:gameOver
            this.gameType = 0
            this.gameBegin.active = true
            this.gameReady.active = false
            this.scrollView.active = false 
        } else {
            this.gameType = 1 
            this.gameBegin.active = false
            this.gameReady.active = true  
        }
        this.gameOver.active = false 
        this.hero.active = true
        this.setTouch()
        // 当前分数
        this.numScore = 0
        this.scoreCurrentPlay.string = 0
        // 对象池技术
        this.blockPool = new cc.NodePool()
        // 两个管道之间的距离
        this.betweenX = 220 
        // 开启碰撞检测系统，未开启时无法检测
        cc.director.getCollisionManager().enabled = true
    },

    setTouch() {
        this.node.on('touchstart', function (event) {
            
        }, this)
        this.node.on('touchmove', function (event) {
            
        }, this)
        this.node.on('touchend', function (event) {
            if (this.gameType === 1) {
                this.gameType = 2
                this.ready.active = false
                const f_randomY = Math.random() * 345 - 95
                this.createBlock(cc.v2(360, f_randomY))
                this.hero.stopActionByTag(3)
            }
            if (this.gameType === 2) {
                cc.audioEngine.play(this.wing, false, 1)
                this.hero.stopActionByTag(2)
                const brid = this.hero.getComponent('hero')
                brid.fall = false
                brid.time = 0
                brid.setRotation('up')
                const act_1 = cc.moveBy(0.3, cc.v2(0, 80)).easing(cc.easeCubicActionOut())
                const act_2 = cc.callFunc(function () {
                    brid.fall = true
                    brid.setRotation('down')
                }.bind(this))
                const end = cc.sequence(act_1, act_2)
                end.setTag(2)
                this.hero.runAction(end)
            }
        }, this)
    },

    gameOverCheck() {
        const scoreData = cc.sys.localStorage.getItem('rank_score')
        let classBestScoreArray = JSON.parse(scoreData)
        let oldScoreBest = null
        if(classBestScoreArray !== null) {
            oldScoreBest = classBestScoreArray[0]._score
        }
        if(oldScoreBest !== null && this.numScore <= oldScoreBest) {
            this.gameOverOver()
        } else {
            this.gameReady.active = false
            this.nameInput.active = true
        }
    },

    gameOverOver() {
        this.gameReady.active = false
        this.nameInput.active = false
        this.gameOver.active = true
        this.scoreCurrentOver.string = this.numScore
        this.scoreBestOver.string = this.numScore

        class gameScoreInfo {
            constructor(name, score) {
                this._name = name
                this._score = score
            }
        }

        // 读数据
        const scoreData = cc.sys.localStorage.getItem('rank_score')
        let classBestScoreArray = JSON.parse(scoreData)

        let oldScoreBest = 0
        if(classBestScoreArray !== null) {
            oldScoreBest = classBestScoreArray[0]._score
        }
        let playerName = 'lgl'
        if(this.getName !== "")
            playerName = this.getName
        if(!classBestScoreArray) {
            classBestScoreArray = []
            const gameScoreNow = new gameScoreInfo(playerName, this.numScore)
            classBestScoreArray.unshift(gameScoreNow)
        } else if(this.numScore > oldScoreBest) {
            let tempArray = []
            let isSame = false
            for(let i = 0; i < classBestScoreArray.length; i++) {
                if(classBestScoreArray[i]._name === playerName) {
                    isSame = true
                    break
                }
            }
            if(isSame === true) {
                for(let i = 0; i < classBestScoreArray.length; i++) {
                    if(classBestScoreArray[i]._name !== playerName) {
                        tempArray.push(classBestScoreArray[i])
                    }
                }
                classBestScoreArray = tempArray
                
                const gameScoreNow = new gameScoreInfo(playerName, this.numScore)
                classBestScoreArray.unshift(gameScoreNow)

                // sort 按照得分从大到小
                classBestScoreArray = Array.from(classBestScoreArray).sort((a, b) => b._score - a._score)
            } else {
                const gameScoreNow = new gameScoreInfo(playerName, this.numScore)
                classBestScoreArray.unshift(gameScoreNow)
            }
        } else if(this.numScore < oldScoreBest) {
            this.scoreBestOver.string = oldScoreBest
        }
        // 存数据
        const baseData = JSON.stringify(classBestScoreArray)
        cc.sys.localStorage.setItem('rank_score', baseData)
    },

    createBlock(pos) {
        let block = null
        if (this.blockPool.size() > 0) { 
            // 通过 size 接口判断对象池中是否有空闲的对象
            block = this.blockPool.get()
        } else { 
            // 对象池中备用对象不够
            block = cc.instantiate(this.preBlock)
        }
        block.parent = this.blockParent 
        block.getComponent('block').init()
        block.setPosition(pos)
    },

    createRankInfo() {
        let rankInfo = null
        let scoreData = cc.sys.localStorage.getItem('rank_score')
        let classBestScoreArray = JSON.parse(scoreData)
        if (classBestScoreArray === null) 
            return
        for(let i = 0; i < classBestScoreArray.length;i++) {
            rankInfo = cc.instantiate(this.preRankInfo)
            rankInfo.setPosition(cc.v2(0, -i * (rankInfo.height + this.rankInfoGap) - rankInfo.height / 2))
            rankInfo.getComponent('rank').init(i + 1, classBestScoreArray[i]._name, classBestScoreArray[i]._score)
            rankInfo.parent = this.rankInfoParent
        }
        this.rankInfoParent.height = classBestScoreArray.length * (rankInfo.height + this.rankInfoGap)
    },

    onBlockKilled: function (block) {
        // block 应该是一个 cc.Node
        // 和初始化时的方法一样，将节点放进对象池，这个方法会同时调用节点的 removeFromParent
        this.blockPool.put(block)
    },

    pdCreaBlock() {
        const children = this.blockParent.children
        let numBlock = 0
        let arr_x = []
        for (let i = 0; i < children.length; i++) {
            let brid_block = children[i].getComponent('block')
            if (brid_block) {
                numBlock++
                arr_x.push(children[i].x)
            }
        }
        if (numBlock === 0) {
            const f_randomY = Math.random() * 345 - 95
            this.createBlock(cc.v2(360, f_randomY))
        }
        if (numBlock < 5) {
            const f_x = arr_x[arr_x.length - 1] + this.betweenX
            const f_randomY = Math.random() * 345 - 95
            this.createBlock(cc.v2(f_x, f_randomY))
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

    actLabel() {
        this.labPlay.stopAllActions()
        this.labPlay.rotation = 0
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

    clickBtn: function (sender, str) {
        if (str === 'btnPlay') {
            if(cc.director.getScene().name !== "game")
                cc.director.loadScene("game")
        } else if (str === 'btnOver') {
            this.cleanAllBlocks()
            this.gameOver.active = false
            this.gameReady.active = true
            this.hero.stopAllActions()
            this.hero.rotation = 0
            this.hero.setPosition(cc.v2(-140, 85))
            this.ready.active = true
            this.actHero()
            this.actLabel()
            this.gameType = 1
            this.numScore = 0
            this.scoreCurrentPlay.string = this.numScore
        } else if (str === 'btnRank') {
            this.gameBegin.active = false
            this.scrollView.active = true
            this.createRankInfo()
        } else if (str === 'btnReturnMain') {
            cc.director.loadScene("begin") // todo
        } else if (str === 'btnPush') {
            this.getName = this.playerNameEditBox.string
            this.gameOverOver()
        }
    },

    // 移除所有管道
    cleanAllBlocks() {
        const children = this.blockParent.children
        for (let i = children.length - 1; i >= 0; i--) {
            const brid_block = children[i].getComponent('block')
            if (brid_block) {
                this.onBlockKilled(children[i])
            }
        }
    },

    addScore() {
        const children = this.blockParent.children
        for (let i = children.length - 1; i >= 0; i--) {
            const brid_block = children[i].getComponent('block')
            if (brid_block) {
                if (this.hero.x - children[i].x > 40 && brid_block.canScore) {
                    cc.audioEngine.play(this.coin, false, 1)
                    brid_block.canScore = false
                    this.numScore++
                    this.scoreCurrentPlay.string = this.numScore
                }
            }
        }
    },

    update(dt) {//1秒执行60次 dt：1/60
        this.runLand()
        if (this.gameType !== 2) return
        this.pdCreaBlock()
        this.addScore()
    },
});
