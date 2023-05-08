cc.Class({
    extends: cc.Component,

    properties: {
        rank: cc.Label,
        playerName: cc.Label,
        score: cc.Label,
    },

    init(_rank, _name, _score) {
        this.rank.string = _rank
        this.playerName.string = _name
        this.score.string = _score
    },

});
