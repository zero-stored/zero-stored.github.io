
import { compressJson,decompressJson } from '../../scripts/base-converter.js';
window.onload = function() {
    let id = 0;
    let texts = [];
    let lines = [];
    let elipses = [];
    let dragIndex = -1;
    let offsetX, offsetY;
    let mouseDownTime,startX,startY;
    let tmpId = 0;
    let mode = 'move';
    const canvasContainer = document.querySelector('.canvas-container');
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const toggleButton = document.querySelector('.toggle-button');
    const inputBox = document.getElementById('inputBox');
    const radialMenu = document.getElementById('radialMenu');
    const urlInputBox = document.getElementById('urlAreaInputBox');
    let isCanvasDragging = false;
    let isBlockDragging = false;
    let isDrawLineDragging = false;
    let isElipseDragging = false;
    let isElipseMoveDragging = false;
    let canvasOffsetX = canvas.width / 2 - canvasContainer.clientWidth / 2;
    let canvasOffsetY = canvas.height / 2 - canvasContainer.clientHeight / 2;
    let longPressTimer;
    canvas.style.left = -canvasOffsetX + 'px';
    canvas.style.top = -canvasOffsetY + 'px';
    const popup = document.getElementById('popup');
    document.getElementById('helpButton').addEventListener('click', function() { popup.style.display = 'block'; });
    document.getElementById('closeButton').addEventListener('click', function() { popup.style.display = 'none'; });

    canvasContainer.addEventListener('mousedown', (e) => {
        inputBox.style.width = "5px";
        if(inputBox.value != ""){
            addTextToCanvas();
            inputBox.value = "";
        }

        longPressTimer = setTimeout(() => {
            releaseFlag();
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            radialMenu.style.left = `${x - 100 - canvasOffsetX}px`;
            radialMenu.style.top = `${y - 100 - canvasOffsetY}px`;
            radialMenu.style.display = 'block';
        }, 200); // 長押しの判定時間

        mouseDownTime = new Date().getTime();
        startX = e.clientX;
        startY = e.clientY;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if(mode == "move"){ //移動する
            texts.forEach((textObj, index) => {
                if (x > textObj.x - 2 && x < textObj.x + textObj.w + 2 &&
                    y > textObj.y - textObj.h && y < textObj.y + 2) {
                    dragIndex = index;
                    offsetX = x - textObj.x;
                    offsetY = y - textObj.y;
                    isBlockDragging = true;
                }
            });
            if(!isBlockDragging){
                elipses.forEach((elipseObj,index) => {
                    var rx = Math.abs(elipseObj.w / 2);
                    var ry = Math.abs(elipseObj.h / 2);
                    var cx = elipseObj.x + elipseObj.w / 2;
                    var cy = elipseObj.y + elipseObj.h / 2; 
                    var normalizedX = (x - cx) / rx;
                    var normalizedY = (y - cy) / ry;
                    if( normalizedX * normalizedX + normalizedY * normalizedY <= 1){
                        dragIndex = index;
                        offsetX = x - elipseObj.x;
                        offsetY = y - elipseObj.y;
                        isElipseMoveDragging = true;
                    }
                });
            }
            if(!isBlockDragging && !isElipseMoveDragging){
                isCanvasDragging = true;
                startX = e.clientX;
                startY = e.clientY;
            }
        }
        else if(mode == "line"){
            const rect = canvas.getBoundingClientRect();
            texts.forEach((textObj, index) => {
                if (x > textObj.x - 4 && x < textObj.x + textObj.w + 4 &&
                    y > textObj.y - textObj.h -2 && y < textObj.y + 2) {
                    dragIndex = index;
                    isDrawLineDragging = true;
                }
            });
        }
        else if(mode == "elipse"){
            isElipseDragging = true;
        }
        else if(mode == "delete"){
            DeleteObj(x,y);
        }
    });

    canvasContainer.addEventListener('mousemove', (e) => {
        if(isBlockDragging){
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            texts[dragIndex].x = x - offsetX;
            texts[dragIndex].y = y - offsetY;
            drawCanvas();
            clearTimeout(longPressTimer);
        }
        if (isCanvasDragging) {
            let dx = startX - e.clientX;
            let dy = startY - e.clientY;
            canvasOffsetX += dx;
            canvasOffsetY += dy;
            canvas.style.left = -canvasOffsetX + 'px';
            canvas.style.top = -canvasOffsetY + 'px';
            startX = e.clientX;
            startY = e.clientY;
            clearTimeout(longPressTimer);
        }
        if(isDrawLineDragging){
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            drawCanvas();
            texts.forEach((textObj, index) => {
                if (x > textObj.x - 5 && x < textObj.x + textObj.w + 5 &&
                    y > textObj.y - textObj.h  -5 && y < textObj.y + 5) {
                        magnifyBlockIndex(index);
                    }
                });
            drawCurve(texts[dragIndex].x,texts[dragIndex].y,x,y);
            clearTimeout(longPressTimer);
        }
        if(isElipseDragging){
            const rect = canvas.getBoundingClientRect();
            const currentX = e.clientX;
            const currentY = e.clientY;
            var width = currentX - startX;
            var height = currentY - startY;
            drawCanvas();
            drawEllipse(startX - rect.left, startY - rect.top, width, height);
            clearTimeout(longPressTimer);
        }
        if(isElipseMoveDragging){
            elipses[dragIndex].x = elipses[dragIndex].x + e.clientX - startX;
            elipses[dragIndex].y = elipses[dragIndex].y + e.clientY - startY;
            startX = e.clientX;
            startY = e.clientY;
            drawCanvas();
            clearTimeout(longPressTimer);
        }
    });

    canvasContainer.addEventListener('mouseup', (e) => {
        const mouseUpTime = new Date().getTime(); 
        const timeDiff = mouseUpTime - mouseDownTime;
        const distance = (e.clientX - startX) **2 + (e.clientY - startY) **2 ;
        if(timeDiff < 200 && distance < 25){
            if(e.clientY > 100){
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                addText(x,y);
            }
        }
        if(isDrawLineDragging){
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            texts.forEach((textObj, index) => {
                if (x > textObj.x - 5 && x < textObj.x + textObj.w + 5 &&
                    y > textObj.y - textObj.h  -5 && y < textObj.y + 5) {
                    lines.push({s:texts[dragIndex].id,e:textObj.id});
                }
            });
            drawCanvas();
        }
        if(isElipseDragging){
            const rect = canvas.getBoundingClientRect();
            const currentX = e.clientX;
            const currentY = e.clientY;
            const width = currentX - startX;
            const height = currentY - startY;
            elipses.push({x:startX- rect.left,y:startY- rect.top,w:width,h:height});
            drawCanvas();
        }
        releaseFlag();
    });

    canvasContainer.addEventListener('mouseleave', () => {
        releaseFlag();
    });

    function releaseFlag(){
        isCanvasDragging = false;
        isBlockDragging = false;
        isDrawLineDragging =false;
        isElipseDragging =false;
        isElipseMoveDragging = false;
        clearTimeout(longPressTimer);
        drawCanvas();
        radialMenu.style.display = 'none';
    }

    function addText(x,y){
        var default_txt="";
        for(let i = 0;i<texts.length;i++){
            if (x > texts[i].x - 2 && x < texts[i].x + texts[i].w + 2 &&
                y > texts[i].y - texts[i].h && y < texts[i].y + 2) {
                default_txt = texts[i].text;
                x = texts[i].x ;
                y = texts[i].y ;
                tmpId = texts[i].id;
                texts.splice(i,1);
                break;                
            }
        }

        if(default_txt != ""){
            ctx.font = '32px Arial';
            const textMetrics = ctx.measureText(default_txt);
            const textWidth = textMetrics.width;
            inputBox.style.width = textWidth+2 + 'px';
        }
        inputBox.style.display='flex';
        inputBox.style.left = `${x - canvasOffsetX}px`;
        inputBox.style.top = `${y - canvasOffsetY -25}px`;
        inputBox.focus();
        inputBox.value = default_txt;
        inputBox.dataset.x = x;
        inputBox.dataset.y = y;
        drawCanvas();
    };


    function magnifyBlockID(id){
        texts.forEach((textObj, index) => {
            if(textObj.id == id){
                magnifyBlockIndex(index);
            }
        });
    }

    function magnifyBlockIndex(index){
        ctx.font = '60px Arial';
        ctx.fillStyle = "white";
        const textMetrics = ctx.measureText(texts[index].text);
        const textWidth = textMetrics.width;
        const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
        ctx.fillRect(texts[index].x -2*3, texts[index].y - textHeight, textWidth + 4*3, textHeight+ 4);
        ctx.fillStyle = "black";
        ctx.fillText(texts[index].text, texts[index].x, texts[index].y);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(texts[index].x - 2*3 , texts[index].y - textHeight - 2*3, textWidth + 4*3, textHeight+ 4*3);
    }

    function searchTexts(id){
        for(let i = 0 ;i< texts.length;i++){
            if(texts[i]["id"] == id){
                return texts[i];
            }
        }
        return null;
    }

    function drawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);        
        for (let i = 0; i < lines.length; i++) {
            const start = searchTexts(lines[i]["s"]);
            const end = searchTexts(lines[i]["e"]);
            if(start == null || end == null)continue;
            const startX = start.x + start.w / 2;
            const startY = start.y - start.h / 2;
            const endX = end.x + end.w / 2;
            const endY = end.y - end.h / 2;
            drawCurve(startX, startY, endX, endY);
        }
        for(let i = 0;i<elipses.length;i++){
            drawEllipse(elipses[i].x,elipses[i].y,elipses[i].w,elipses[i].h);
        }
        ctx.font = '32px Arial';
        texts.forEach((textObj) => {
            ctx.fillStyle = "white";
            ctx.fillRect(textObj.x - 2, textObj.y - textObj.h, textObj.w + 4, textObj.h + 4);
            ctx.fillStyle = "black";
            ctx.fillText(textObj.text, textObj.x, textObj.y);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(textObj.x - 2, textObj.y - textObj.h -2 , textObj.w + 4, textObj.h + 4);
        });
        updateURL();
    }

    toggleButton.addEventListener('click', toggleMode);
    function toggleMode() {
        switch (mode) {
            case 'move':
                mode = 'line'
              break;
            case 'line':
                mode = 'elipse'
                break;
            case 'elipse':
                mode = 'delete'
                break;
            case 'delete':
                mode = 'move'
                break
            default:
          }
        toggleButton.textContent = `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
    }

    function drawCurve(x1, y1, x2, y2) {
        const cp1x = (x1 + x2) / 2;
        const cp1y = y1;
        const cp2x = (x1 + x2) / 2;
        const cp2y = y2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
        ctx.strokeStyle = 'dimgray';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function addTextToCanvas() {
        const text = inputBox.value;
        const x = parseInt(inputBox.dataset.x);
        const y = parseInt(inputBox.dataset.y);
        const base_id = tmpId == 0 ? id : tmpId ;
        if (text) {
            ctx.font = '32px Arial';
            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;
            const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
            texts.push({id:base_id, text, x,y, w: textWidth, h: textHeight});
            id ++;
            tmpId = 0;
        }
        inputBox.style.display='none';
        drawCanvas();
    }

    function DeleteObj(x,y){
        for(let i = 0;i<texts.length;i++){
            if (x > texts[i].x - 2 && x < texts[i].x + texts[i].w + 2 &&
                y > texts[i].y - texts[i].h && y < texts[i].y + 2) {
                texts.splice(i,1);
                return;                
            }
        }
        for(let i = 0;i<elipses.length;i++){
            const rx = Math.abs(elipses[i].w / 2);
            const ry = Math.abs(elipses[i].h / 2);
            const cx = elipses[i].x + elipses[i].w / 2;
            const cy = elipses[i].y + elipses[i].h / 2; // 楕円の方程式を使用 
            const normalizedX = (x - cx) / rx;
            const normalizedY = (y - cy) / ry;
            if( normalizedX * normalizedX + normalizedY * normalizedY <= 1){
                elipses.splice(i,1);
                return;          
            }
        }
    }

    function drawEllipse(x, y, w, h) {
        ctx.beginPath();
        ctx.ellipse(
            x + w / 2,
            y + h / 2, 
            Math.abs(w / 2), 
            Math.abs(h / 2), 
            0, 
            0, 
            2 * Math.PI 
        );
        ctx.fillStyle = 'rgba(128, 128, 128, 0.2)'; 
        ctx.fill();
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.2)'; 
        ctx.stroke();
    }

    const radialMoveButton = document.getElementById('radialMove');
    radialMoveButton.addEventListener('mouseup', (e) => {
        mode="move";
        toggleButton.textContent = `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
    });
    const radialLineButton = document.getElementById('radialLine');
    radialLineButton.addEventListener('mouseup', (e) => {
        mode="line";
        toggleButton.textContent = `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
    });
    const radialElipseButton = document.getElementById('radialElipse');
    radialElipseButton.addEventListener('mouseup', (e) => {
        mode="elipse";
        toggleButton.textContent = `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
    });
    const radialDeleteButton = document.getElementById('radialDelete');
    radialDeleteButton.addEventListener('mouseup', (e) => {
        mode="delete";
        toggleButton.textContent = `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
    });

    inputBox.addEventListener('input',(e) =>{
        ctx.font = '32px Arial';
        const textMetrics = ctx.measureText(e.target.value);
        const textWidth = textMetrics.width;
        inputBox.style.width = textWidth+2 + 'px';
    });

    const saveButton = document.getElementById('copyButton');
    saveButton.addEventListener('click',(e) =>{
        navigator.clipboard.writeText(urlInputBox.value) 
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
    const reloadButton = document.getElementById('reloadButton');
    reloadButton.addEventListener('click',(e) =>{
        setURL();
        swal.fire({
            title: "Reload url.",
            icon: "success",
            showConfirmButton: false,
            timer:1500
            });
    });

    function updateURL(){
        const datas = {id,texts,lines,elipses};
        urlInputBox.value = 'https://zero-stored.github.io/mindmap.html?data=' + compressJson(datas);
    }

    function setURL(){
        const url = new URL(urlInputBox.value);
        const params = new URLSearchParams(url.search);
        if (params.has('data')) {
            const datas = decompressJson(params.get('data'));
            id = datas.id;
            texts = datas.texts;
            lines = datas.lines;
            elipses = datas.elipses;
            drawCanvas();
        } 
    }
    function init(){
        urlInputBox.value = window.location.href;
        setURL();
        drawCanvas();
    }
    init();
};
