
import { compressJson,decompressJson } from '/scripts/base-converter.js';
window.onload = function() {
    const canvas = document.getElementById("arena");
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    if (!params.has('data')) {
        return;
    } 
    const datas = decompressJson(params.get('data'));
    const stage = datas.stage;
    document.title = stage;
    const myRobot = decompressJson(datas.myRobot);
    const myRobotCode = myRobot.code;
    const enemy = datas.enemy;
    const enemies = enemy.enemies.map(str => {
        return "/robocode/robot/" + str + ".js";
      });

    const workerCodeBef = `
    (function(){
        var $ENABLE_DEBUG, console, logger;
        $ENABLE_DEBUG = false;
        if (!console) {
        console = {
            log: function(msg){
            var data;
            data = {
                "log": msg
            };
            return postMessage(JSON.stringify(data));
            }
        };
        }
        logger = {};
        logger.log = function(msg){
        if ($ENABLE_DEBUG) {
            return console.log(msg);
        }
        };
        var BaseRobot;
        BaseRobot = (function(){
            BaseRobot.displayName = 'BaseRobot';
            var prototype = BaseRobot.prototype, constructor = BaseRobot;
            prototype.me = {
            id: 0,
            x: 0,
            y: 0,
            hp: 0
            };
            prototype.enemySpot = [];
            function BaseRobot(name){
            var this$ = this;
            this.name = name != null ? name : "base-robot";
            this.event_counter = 0;
            this.callbacks = {};
            self.onmessage = function(e){
                try{
                return this$.receive(e.data);
                }
                catch(err) {
                console.log( err.message );
                }
            };
            }
            prototype.move_forwards = function(distance, callback){
            callback == null && (callback = null);
            this.send({
                "action": "move_forwards",
                "amount": distance
            }, callback);
            };
            prototype.move_backwards = function(distance, callback){
            callback == null && (callback = null);
            this.send({
                "action": "move_backwards",
                "amount": distance
            }, callback);
            };
            prototype.move_opposide = function(distance, callback){
            callback == null && (callback = null);
            this.send({
                "action": "move_opposide",
                "amount": distance
            }, callback);
            };
            prototype.turn_left = function(angle, callback){
            callback == null && (callback = null);
            this.send({
                "action": "turn_left",
                "amount": angle
            }, callback);
            };
            prototype.turn_right = function(angle, callback){
            callback == null && (callback = null);
            this.send({
                "action": "turn_right",
                "amount": angle
            }, callback);
            };
            prototype.turn_turret_left = function(angle, callback){
            callback == null && (callback = null);
            this.send({
                "action": "turn_turret_left",
                "amount": angle
            });
            };
            prototype.turn_turret_right = function(angle, callback){
            callback == null && (callback = null);
            this.send({
                "action": "turn_turret_right",
                "amount": angle
            });
            };
            prototype.shoot = function(){
            this.send({
                "action": "shoot"
            });
            };
            prototype.yell = function(msg){
            this.send({
                "action": "yell",
                "msg": msg
            });
            };
            prototype.receive = function(msg){
            var msg_obj;
            msg_obj = JSON.parse(msg);
            if (msg_obj.me) {
                this.me = msg_obj.me;
            }
            switch (msg_obj["action"]) {
            case "run":
                this._run();
                break;
            case "callback":
                logger.log('callback');
                logger.log(this.event_counter);
                if (typeof this.callbacks[msg_obj["event_id"]] === "function") {
                this.callbacks[msg_obj["event_id"]]();
                }
                this.event_counter--;
                if (this.event_counter === 0) {
                this._run();
                }
                break;
            case "interruption":
                logger.log('interruption');
                logger.log(this.event_counter);
                this.event_counter = 0;
                if (msg_obj["status"].wallCollide) {
                this.onWallCollide();
                }
                if (msg_obj["status"].isHit) {
                this.onHit();
                }
                console.log('onhit-and-run');
                this._run();
                break;
            case "enemy-spot":
                logger.log('enemy-spot');
                this.enemySpot = msg_obj["enemy-spot"];
                this.onEnemySpot();
            }
            };
            prototype._run = function(){
            var this$ = this;
            logger.log(this.event_counter);
            console.log('run');
            setTimeout(function(){
                return this$.onIdle();
            }, 0);
            };
            prototype.onIdle = function(){
            throw "You need to implement the onIdle() method";
            };
            prototype.onWallCollide = function(){
            throw "You need to implement the onWallCollide() method";
            };
            prototype.onHit = function(){};
            prototype.onEnemySpot = function(){};
            prototype.send = function(msg_obj, callback){
            var event_id;
            logger.log('send' + " " + msg_obj.action);
            event_id = this.event_counter++;
            this.callbacks[event_id] = callback;
            msg_obj["event_id"] = event_id;
            postMessage(JSON.stringify(msg_obj));
            };
            return BaseRobot;
        }());`;
    const workerCodeAft = "}).call(this);"
    const blob = new Blob([workerCodeBef + myRobotCode + workerCodeAft], { type: 'application/javascript' });
    const workerURL = URL.createObjectURL(blob);
    if (stage == "stageCode"){
        const enemyCode = decompressJson(enemy.code).code;
        const enemyBlob = new Blob([workerCodeBef + enemyCode + workerCodeAft], { type: 'application/javascript' });
        const enemyWorkerURL = URL.createObjectURL(enemyBlob);
        var battle = new Battle(
            canvas.getContext("2d"),
            canvas.width,
            canvas.height,
            [workerURL,enemyWorkerURL]
        );
    }
    else{
        const tanks = [workerURL];
        var battle = new Battle(
            canvas.getContext("2d"),
            canvas.width,
            canvas.height,
            tanks.concat(enemies)
        );
    }

    battle.run();
};