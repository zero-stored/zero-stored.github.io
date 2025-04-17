
import { compressJson,decompressJson } from '../../scripts/base-converter.js';
window.onload = async function() {
    const popup = document.getElementById('popup');
    document.getElementById('helpButton').addEventListener('click', function() { popup.style.display = 'block'; });
    document.getElementById('closeButton').addEventListener('click', function() { popup.style.display = 'none'; });

    const myrobotArea = document.getElementById("myrobotArea");

    const refSrcName = document.getElementById('refSrcName');
    const myRobotTextArea = document.getElementById('myRobotTextArea');
    const baseRobotTextArea = document.getElementById('baseRobotTextArea');

    const stageInfo = {
        "stage1":["enemy-1"],
        "stage2":["enemy-1","enemy-0"],
        "stage3":["enemy-1","enemy-0","enemy-0"],
        "stage4":["enemy-1","enemy-2"],
        "stage5":["enemy-2","enemy-3"],
        "stage6":["enemy-3","enemy-0","enemy-0","enemy-0"],
        "stage7":["enemy-2","enemy-4","enemy-0","enemy-0"],
        "stage8":["enemy-2","enemy-2","enemy-4","enemy-4"],
        "stage9":["enemy-2","enemy-2","enemy-5"],
        "stage10":["enemy-5","enemy-5","enemy-5"],
        "stage11":["enemy-2","enemy-2","enemy-2","enemy-2","enemy-2","enemy-2"],
        "stage12":["enemy-5","enemy-4","enemy-3","enemy-2","enemy-1","enemy-0"],
        "stage13":["enemy-0","enemy-0","enemy-0","enemy-0","enemy-0","enemy-0","enemy-0","enemy-0","enemy-0","enemy-0","enemy-0"],
        "stage14":["enemy-5","enemy-2","enemy-2","enemy-0","enemy-0","enemy-0","enemy-0","enemy-0","enemy-0","enemy-0"],
        "stage15":["enemy-5","enemy-5","enemy-5","enemy-2","enemy-2"],
        "stage16":["enemy-4","enemy-4","enemy-4","enemy-4","enemy-2","enemy-2","enemy-2","enemy-2"],
        "stage17":["enemy-4","enemy-4","enemy-4","enemy-4","enemy-4","enemy-4","enemy-4","enemy-5"],
        "stage18":["enemy-1","enemy-1","enemy-1","enemy-1","enemy-1","enemy-1","enemy-1","enemy-1","enemy-1","enemy-1","enemy-1","enemy-1"],
        "stage19":["enemy-1","enemy-1","enemy-2","enemy-2","enemy-3","enemy-3","enemy-4","enemy-4"],
        "stage20":["enemy-5","enemy-5","enemy-5","enemy-5","enemy-5","enemy-5","enemy-5","enemy-5","enemy-5","enemy-5"],
        "stageCode":[]
    }


    const baseCode = `var $ENABLE_DEBUG, console, logger;
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
}());`
    const myRobotCode = `var MyRobot, tr;
MyRobot = (function(superclass){
    var prototype = extend$((import$(MyRobot, superclass).displayName = 'MyRobot', MyRobot), superclass).prototype, constructor = MyRobot;
    prototype.onIdle = function(){
    this.move_forwards(40);
    this.turn_turret_left(30);
    this.turn_right(90);
    };
    prototype.onWallCollide = function(){
    this.move_opposide(30);
    this.turn_left(90);
    };
    prototype.onHit = function(){
    this.yell("Oops!");
    };
    prototype.onEnemySpot = function(){
    this.yell("Fire!");
    this.shoot();
    };
    function MyRobot(){
    MyRobot.superclass.apply(this, arguments);
    }
    return MyRobot;
}(BaseRobot));
tr = new MyRobot("MyRobot");
function extend$(sub, sup){
    function fun(){} fun.prototype = (sub.superclass = sup).prototype;
    (sub.prototype = new fun).constructor = sub;
    if (typeof sup.extended == 'function') sup.extended(sub);
    return sub;
}
function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
}
    `;

    const codeBef = "(function(){"
    const codeAft = "}).call(this);"

    async function initCodeTextArea(){
        myRobotTextArea.textContent = myRobotCode;
        try {
            const response = await fetch("/robocode/scripts/Information.md");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const jsCode = await response.text(); 
            baseRobotTextArea.textContent = jsCode;
        } catch (err) {
            console.error("Fetch error:", err);
            baseRobotTextArea.textContent = `取得に失敗しました: ${err.message}`;
        }
    }
    await initCodeTextArea();

    //CodeMirror
    const myEditor = CodeMirror.fromTextArea(myRobotTextArea, {
        lineNumbers: true,
        mode: "javascript",
        theme: "default",
        indentUnit: 2,
        tabSize: 2,
        lineWrapping: true,
      });
      const baseEditor = CodeMirror.fromTextArea(baseRobotTextArea, {
          lineNumbers: true,
          mode: "javascript",
          theme: "default",
          indentUnit: 2,
          tabSize: 2,
          lineWrapping: true,
        });
        baseEditor.setOption("readOnly", true);

    myEditor.on("change", function(cm, changeObj) {
        machineCodeInputBox.value = "";
        myrobotArea.style.display = 'none';
        verifyResult.textContent = "";
    });

    const viewSrcButtons = document.getElementsByClassName("src-view-button");
    for(let i = 0; i<viewSrcButtons.length;i++ ){
        viewSrcButtons[i].addEventListener('click',async function(event) {
            let url = viewSrcButtons[i].textContent.trim();
            refSrcName.textContent = url;
            if (url.includes("myrobot") || url.includes("enemy")){
                url = "/robocode/robot/" + url;
            } 
            else{
                url = "/robocode/scripts/" + url;
            }
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const jsCode = await response.text(); 
                baseEditor.setValue(jsCode);
            } catch (err) {
            console.error("Fetch error:", err);
            baseEditor.setValue(`取得に失敗しました: ${err.message}`);
            }
        });
    }

    const verifyResult = document.getElementById('verifyResult');
    document.getElementById('verifyCodeButton').addEventListener('click', function() {
        try{
            eval(codeBef+baseCode+myEditor.getValue()+codeAft)
            verifyResult.textContent = "ok";
            myrobotArea.style.display = 'block';
            const datas = {code:myEditor.getValue()};
            machineCodeInputBox.value = compressJson(datas);
        }catch(err){
            myrobotArea.style.display = 'none';
            verifyResult.textContent =  err;
            const match = err.stack.match(/<anonymous>:(\d+):(\d+)/);
            machineCodeInputBox.value = "";
            if (match) {
                verifyResult.textContent = verifyResult.textContent + ": line " + match[1];
            }
            console.error(err);
        }
    });
    document.getElementById('initCodeButton').addEventListener('click', function() {
        myEditor.setValue(myRobotCode);
    });
    
    const stageButtons = document.getElementsByClassName("stage-select-button");
    const stageName = document.getElementById("stageName");
    const stageDescription = document.getElementById("stageDescription");
    const enemyCodeInputBox = document.getElementById("enemyCodeInputBox");

    for(let i = 0; i<stageButtons.length;i++ ){
        stageButtons[i].addEventListener('click', function(event) {
            const stage =this.id.replace("Button","");
                stageName.textContent =  "Stage:" + stage;
                stageDescription.innerHTML="";
            if(stage == "stageCode"){
                enemyCodeInputBox.style.display = "block";
                stageDescription.innerHTML="入力した機体コードの敵と戦うことができます";
            }
            else{
                enemyCodeInputBox.style.display = "none";
                for(let j = 0; j< stageInfo[stage].length;j++){
                    AddMachine(stageInfo[stage][j]);
                }                
            }
        });
    }
    function AddMachine(machieType){
        const img = document.createElement('img');
        img.src = `/robocode/img/tank/${machieType}.png`;        
        stageDescription.appendChild(img);
    }

    const sortieButton = document.getElementById("sortieButton");
    sortieButton.addEventListener('click', function(event) {
        if(machineCodeInputBox.value == ""){
            swal.fire({
               title: "出撃待機中",
               text: "コード検証を行ってください.",
               timer:3000,
               position: "center"
               });
               return;
        }
        const stage = stageName.textContent.replace("Stage:","");
        if(stage == ""){
            swal.fire({
               title: "出撃待機中",
               text: "ステージを選んでください.",
               timer:3000,
               position: "center"
               });
               return;
        }
    
        if(stage == "stageCode" && enemyCodeInputBox.value == ""){
            swal.fire({
               title: "出撃待機中",
               text: "敵コードを入力してください.",
               timer:3000,
               position: "center"
               });
               return;
        }
        const windowName = stage; 
        const features = "width=700,height=700,resizable=no";
        const datas = {stage,myRobot:machineCodeInputBox.value,enemy:{code:enemyCodeInputBox.value,enemies:stageInfo[stage]}};
        window.open("/robocode/stage/stage.html?data=" + compressJson(datas) , windowName, features);
    });

    const saveButton = document.getElementById('copyButton');
    saveButton.addEventListener('click',(e) =>{
        navigator.clipboard.writeText(machineCodeInputBox.value) 
            .then(() => {   
                swal.fire({
                    title: "Copied to clipboard.",
                    icon: "success",
                    showConfirmButton: false,
                    position: "top-end",
                    timer:1000
                    });
            }) 
            .catch(err => {
                 swal.fire({
                    title: "Oops...",
                    text: "Failed to  Copied to clipboard." + err,
                    icon: "error",
                    position: "top-end"
                    });
                });
    });
    
    
};
