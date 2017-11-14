cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        btnStart: {
            default: null,
            type: cc.Button,
        },
        gameLayer: {
            default: null,
            type: cc.Node,
        },
        overLayer: {
            default: null,
            type: cc.Node,
        },
        platformGroup: [cc.Sprite],
        player:{
            default: null,
            type: cc.Sprite,
        }
    },

    // use this for initialization
    onLoad: function () {
        this.btnStart.node.active = true;
        this._score = 0;
    },
    gameStart: function () {
        var randInfo = this.getRandomPlatformInfo();
        this.platformGroup[0].node.runAction(cc.moveTo(0.5,cc.v2(0,0)));
        this.player.node.runAction(cc.moveTo(0.5,cc.v2(this.platformGroup[0].node.width-7,400)));
        this.setPlatformRandomInfo(this.platformGroup[1],randInfo).node.runAction(cc.moveTo(0.5,randInfo.pos));
    },
    setPlatformRandomInfo: function (platform,info) {
        platform.getComponent(cc.Sprite).node.width = info.width;
        return platform;
    },
    getRandomPlatformInfo: function () {
        var width = 50 + Math.random()*150;
        var pos_y = 0;
        var pos_x = (0.5-Math.random())*100 + 320;
        var info = [];
        info.pos = cc.v2(pos_x,pos_y);
        info.width = width;
        return info;
    },
    registTouchEvent: function () {
        var self = this;
        this.gameLayer.on(cc.Node.EventType.TOUCH_START,function (event) {
            self.createStick();
            self.stretchDelta = 1;
            self.schedule(self.stretchStick,0.05);
        });
        this.gameLayer.on(cc.Node.EventType.TOUCH_END,function (event) {
            self.unschedule(self.stretchStick,self);
            self.stickDown();
        });
    },
    stickReset: function () {
        this.stick.getComponent(cc.Sprite).node.height = 0;
        this.stick.rotation = 0;
    },
    stickDown: function () {
        var self = this;
        var stickLength = self.stick.getComponent(cc.Sprite).node.height;
        var platformDistance = self.platformGroup[1].node.position.x - self.platformGroup[0].node.position.x - self.platformGroup[0].node.width;
        var overDistance = self.platformGroup[1].node.position.x + self.platformGroup[1].node.width - self.platformGroup[0].node.width;

        var rotateRate = 90;
        var moveState = 0;
        if(stickLength > overDistance){
            moveState = 2;
        }else if(stickLength < platformDistance){
            moveState = 1;
            rotateRate = 180;
        }else{
            self._score += 1;
        }

        var act_rotate = cc.rotateTo(0.5,rotateRate);
        var act_callfunc = cc.callFunc(function () {
           // self.stickReset();
            self.heroMove(moveState);
        });
        self.stick.runAction(cc.sequence(act_rotate,act_callfunc));
    },
    heroMove: function (state) {
        var self = this;

        var act = null;
        switch (state){
            case 0:
                var move_x = self.platformGroup[1].node.position.x+self.platformGroup[1].node.width;
                var move_y = self.platformGroup[1].node.height;
                console.log('================move_x:'+move_x);
                var act_move_right = cc.moveTo(move_x/500,cc.v2(move_x,move_y));
                var act_callfunc = cc.callFunc(function () {
                    // self.stickReset();
                    self.platformMove();
                });
                act = cc.sequence(act_move_right,act_callfunc);
                break;
            case 1:
                var move_x = self.player.node.width+self.platformGroup[0].node.width;
                var move_y = self.platformGroup[0].node.height;
                var act_move_right = cc.moveTo(move_x/500,cc.v2(move_x,move_y));
                var act_mvoe_down = cc.moveTo(move_y/500,cc.v2(move_x,0));
                var act_callfunc = cc.callFunc(function () {
                    self.gameOver();
                });
                act = cc.sequence(act_move_right,act_mvoe_down,act_callfunc);
                break;
            case 2:
                var move_x = self.stick.height+self.platformGroup[0].node.width+self.player.node.width;
                var move_y = self.platformGroup[1].node.height;
                var act_move_right = cc.moveTo(move_x/500,cc.v2(move_x,move_y));
                var act_mvoe_down = cc.moveTo(move_y/500,cc.v2(move_x,0));
                var act_callfunc = cc.callFunc(function () {
                    self.gameOver();
                });
                act = cc.sequence(act_move_right,act_mvoe_down,act_callfunc);
                break;
        }
        self.player.node.runAction(act);
    },
    platformMove: function () {
        var self = this;

        //stick move
        self.stickReset();
        //platform move
        var move_y = 0;
        var move_x_1 = self.platformGroup[1].node.width+0;
        var move_x_1_time = move_x_1/500+0.5;

        var move_x_0 = -self.platformGroup[0].node.width;
        self.platformGroup[0].node.runAction(cc.moveTo(move_x_1_time,cc.v2(move_x_0,0)));

        self.platformGroup[1].node.runAction(cc.moveTo(move_x_1_time,cc.v2(0,0)));
        var random_info = self.getRandomPlatformInfo();
        var move_x_2 = 640-random_info.pos.x;
        self.setPlatformRandomInfo(self.platformGroup[2],random_info);
        self.platformGroup[2].node.runAction(cc.moveTo(move_x_1_time,random_info.pos));

        //hero move
        var move_hero_x = self.platformGroup[1].node.width;
        var move_hero_y = self.platformGroup[1].node.height;
        var act_move_to = cc.moveTo(move_x_1_time,cc.v2(move_hero_x,move_hero_y));
        var act_call_func =cc.callFunc(function () {
            var temp = self.platformGroup[0];
            self.platformGroup[0] = self.platformGroup[1];
            self.platformGroup[1] = self.platformGroup[2];
            self.platformGroup[2] = temp;
            self.platformGroup[2].node.position = cc.v2(640,0);
        });
        self.player.node.runAction(cc.sequence(act_move_to,act_call_func));

        self.stickReset();
    },
    gameOver: function () {
        // cc.sys.localStorage.setItem('HIGHEST_SCORE',this._score);
        this.gameLayer.off(cc.Node.EventType.TOUCH_START);
        this.gameLayer.off(cc.Node.EventType.TOUCH_END);
        this.overLayer.getChildByName('lab_score').getComponent(cc.Label).string = '你的得分是：'+this._score;
        this.overLayer.active = true;
    },
    createStick: function () {
        if(this.stick == null){
            this.stick = cc.instantiate(this.platformGroup[0].node);
            this.stick.getComponent(cc.Sprite).node.width = 5;
            this.stick.getComponent(cc.Sprite).node.height = 0;
            this.stick.anchorX = 1;
            this.gameLayer.addChild(this.stick);
        }
        this.stick.position = cc.v2(this.platformGroup[0].node.position.x+this.platformGroup[0].node.width,this.platformGroup[0].node.height);
    },
    stretchStick: function () {
        this.stretchDelta += 0.2;
        this.stick.getComponent(cc.Sprite).node.height += this.stretchDelta*10;
    },
    onClickStart: function () {
        this.gameStart();
        this.btnStart.node.active = false;
        this.registTouchEvent();
    },
    onClickRest: function () {
        cc.director.loadScene('GameScene');
        // this.overLayer.getChildByName('lab_score').getComponent(cc.Label).string = 0;
        // this.overLayer.active = false;
        //
        // this.platformGroup[1].node.position = cc.v2(640,0);
        // this.platformGroup[2].node.position = cc.v2(640,0);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
