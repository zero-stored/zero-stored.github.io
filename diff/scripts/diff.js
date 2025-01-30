window.onload = function() {
    const textEditor1 = document.getElementById('text1');
    const textEditor2 = document.getElementById('text2');
    const lineNumbers1 = document.getElementById('lineNumbers1');
    const lineNumbers2 = document.getElementById('lineNumbers2');
    const hiligtArea1 = document.getElementById('hilight-area1');
    const hiligtArea2 = document.getElementById('hilight-area2');
    
    const similarityThreshold = 0.3;
    const highlightStartClass1 = '<span class="diff-added-1">';
    const highlightStartClass2 = '<span class="diff-added-2">';
    const highlightStartClass3 = '<span class="diff-added-3">';
    const highlightEnd = '</span>';

    const NewLineWord = '###NEWLINE###'
    const scrollbarArea = document.getElementById('scrollbarArea');
    const leftScrollbar = document.getElementById('leftScrollbar');
    const rightScrollbar = document.getElementById('rightScrollbar');
    const scollbarViewArea = document.getElementById('scollbarViewArea');
    const popup = document.getElementById('popup');
    document.getElementById('helpButton').addEventListener('click', function() { popup.style.display = 'block'; });
    document.getElementById('closeButton').addEventListener('click', function() { popup.style.display = 'none'; });
    
    let diffExecuteTimer;
    function extractDiff(str1, str2) {
        let whiteOffset = Math.min(str1.match(/^ */)[0].length,str2.match(/^ */)[0].length);
        str1 = str1.slice(whiteOffset);
        str2 = str2.slice(whiteOffset);
        let foundIdxs2 = [{"foundIdx":0,"i":whiteOffset}];
        let remainStr2 = str2;
        for (let i = str1.length; i > 3 ; i--) {
            for(let j = 0;j +i<= str1.length;j++){
                let foundIdx = remainStr2.indexOf(str1.slice(j,j+i));
                if(foundIdx != -1){
                    foundIdxs2.push({"foundIdx":foundIdx+whiteOffset,i});
                    if(foundIdx == 0){
                        remainStr2 = '_'.repeat(i)+remainStr2.slice(foundIdx+i);   
                    }
                    else{
                        remainStr2 = remainStr2.slice(0,foundIdx)+ '_'.repeat(i) + remainStr2.slice(foundIdx+i);   
                    }
                    if(remainStr2.replaceAll('_','').length<i){
                        i = remainStr2.replaceAll('_','').length + 1;
                    }
                    if (remainStr2.replaceAll('_','').length <3){
                        break;
                    }
                }
            }
        }
        if(remainStr2 != str2){
            remainStr2 = remainStr2.replaceAll('_','') + "。";  
        }

        let foundIdxs1 = [{"foundIdx":0,"i":whiteOffset}];
        let remainStr1 = str1;
        for (let i = str2.length; i > 3 ; i--) {
            for(let j = 0;j +i<= str2.length;j++){
                let foundIdx = remainStr1.indexOf(str2.slice(j,j+i));
                if(foundIdx != -1){
                    foundIdxs1.push({"foundIdx":foundIdx+whiteOffset,i});
                    if(foundIdx == 0){
                        remainStr1 =  '_'.repeat(i) + remainStr1.slice(foundIdx+i);   
                    }
                    else{
                        remainStr1 = remainStr1.slice(0,foundIdx)+ '_'.repeat(i) + remainStr1.slice(foundIdx+i);   
                    }
                    if(remainStr1.replaceAll('_','').length<i){
                        i = remainStr1.replaceAll('_','').length + 1;
                    }
                    if (remainStr1.replaceAll('_','').length <3){
                        break;
                    }
                }
            }
        }       
        if(remainStr1 != str1){
            remainStr1 = remainStr1.replaceAll('_','') + "。";      
        }

        let left = remainStr1 != "。" && remainStr1.length < str1.length * similarityThreshold;
        if(left){
            console.info(foundIdxs1);
            console.info(remainStr2);
        }
        let right = remainStr2 != "。" && remainStr2.length < str2.length * similarityThreshold;
        return {left,right,foundIdxs1,foundIdxs2};
    }

    function getDiff() {
        hiligtArea1.innerHTML = '';
        hiligtArea2.innerHTML = '';
        const text1 = textEditor1.value.replaceAll(NewLineWord+'\n','').replaceAll(NewLineWord+'\r\n','').replaceAll('\n'+NewLineWord,'').split('\n');
        const text2 = textEditor2.value.replaceAll(NewLineWord+'\n','').replaceAll(NewLineWord+'\r\n','').replaceAll('\n'+NewLineWord,'').split('\n');
        let text1Index = 0;
        let text2Index = 0;
        let nextText2Index = 0;
        let highlitText1 = [];//ハイライト情報
        let highlitText2 = [];
        let newLineText1 =[];
        let newLineText2 =[];
        //text1にしかない。または若干の違いがある。
        for (let i = 0; i < text1.length; i++) {
            if(!text1[i]){//空行ガード
                text1[i]=' ';
            }
            for(let j = text2Index; j<text2.length;j++){//前回見つけたところの次から
                if(!text2[j]){//空行ガード
                    text2[j]=' ';
                }
                if(text1[i] == text2[j]){//完全一致 差分なし
                    nextText2Index = j+1;//次にセット
                    highlitText1.push({"idx":i,"diffInfo":[]})
                    highlitText2.push({"idx":j,"pair":i,"diffInfo":[]})
                    break;
                }
                //合致行を探す
                let extractStr = extractDiff(text1[i],text2[j]);//合致チェック
                if(extractStr["left"] || extractStr["right"]){//部分合致 差分あり
                    nextText2Index = j+1;//次にセット
                    if(extractStr["left"]){//左側に追加あり
                        highlitText1.push({"idx":i,"diffInfo":extractStr["foundIdxs1"]})
                    }
                    else{
                        highlitText1.push({"idx":i,"diffInfo":[]})
                    }
                    if(extractStr["right"]){//右側に追加あり
                        highlitText2.push({"idx":j,"pair":i,"diffInfo":extractStr["foundIdxs2"]});
                    }
                    else{
                        highlitText2.push({"idx":j,"pair":i,"diffInfo":[]});
                    }
                    break;
                }
            }
            if(nextText2Index == text2Index){//新規行
                highlitText1.push({"idx":i,"diffInfo":[{"foundIdx":-1,"i":-1}]})
                newLineText2.push(nextText2Index);

            }
            else{//新規行ではない
                for(let j = text2Index; j<nextText2Index-1;j++){
                    newLineText1.push(i);
                }
            }
            text2Index = nextText2Index;
        }
        //確認した2よりも先の部分をNEWLINEとする
        for(let i = text2Index;i<text2.length;i++){
            newLineText1.push(text1.length-1);
        }
        //text2しかないやつをやる
        for (let i = 0; i < text2.length; i++) {
            let flag = false;
            for(let k = 0; k<highlitText2.length;k++){
                if(highlitText2[k]["idx"] == i){
                    flag=true;
                    text1Index = highlitText2[k]["pair"]
                    break;
                }
            }
            if(flag){
                continue;
            }
            highlitText2.push({"idx":i,"diffInfo":[{"foundIdx":-1,"i":-1}]})         
        }
        makeDiffText(text1,newLineText1,textEditor1);
        makeDiffText(text2,newLineText2,textEditor2);
        makeHighLight(text1,highlitText1,hiligtArea1,leftScrollbar,1);
        makeHighLight(text2,highlitText2,hiligtArea2,rightScrollbar,2);
        updateLineNumbers(text1,lineNumbers1);
        updateLineNumbers(text2,lineNumbers2);
    }
    function makeDiffText(text,newLineText,element){
        let offset = 0;
        for(let i = 0; i<newLineText.length;i++){
            text.splice(newLineText[i]+offset,0,NewLineWord);
            offset ++;
        }
        element.value = text.join('\n');
    }
    function makeHighLight(text,highlitText,element,scrollElement,type){
        const lines = text.length;//2も同じ行数
        const textArealineHeight = parseInt(window.getComputedStyle(textEditor1).lineHeight,10);
        const containerHeight = textEditor1.clientHeight;
        const displayedLine = Math.floor(containerHeight / textArealineHeight);
        if(lines > displayedLine){
            scollbarViewArea.style.height = parseInt(100 * displayedLine / lines + 1) +'%';
        }
        else{
            scollbarViewArea.style.height = '100%';
        }
        const lineHeight = Math.max(Math.ceil(100 * 1 / lines),1) + '%'; 
        element.innerHTML = '';
        scrollElement.innerHTML = '';
        let offset = 0;
        for(let i = 0 ;i < text.length;i++){
            if(text[i] == NewLineWord){
                hilightTextAppend(text[i],[{"foundIdx":-1,"i":-1}],element,3);
                let line = document.createElement('div');
                line.style.position = "absolute";
                line.style.width = "47%";
                line.style.height = lineHeight;
                line.style.top = parseInt(100 * i / lines) +'%';
                line.style.background = "gray";
                scrollElement.appendChild(line);  
                offset++;
            }
            else{
                let flag = false;
                for(let j = 0; j<highlitText.length;j++){
                    if(highlitText[j]["idx"] + offset == i){
                        hilightTextAppend(text[i],highlitText[j]["diffInfo"],element,type);
                        if(highlitText[j]["diffInfo"].length != 0 ) {
                            let line = document.createElement('div');
                            line.style.position = "absolute";
                            line.style.width = "47%";
                            line.style.height = lineHeight;
                            line.style.top = parseInt(100 * i / lines) +'%';
                            line.style.background = type == 1 ? "skyblue" : "lightcoral";
                            scrollElement.appendChild(line);  
                        }
                        flag = true;
                        break;
                    }
                }
                if(!flag){
                    hilightTextAppend(text[i],[],element,type);
                }
            }
        }
    }

    function hilightTextAppend(text,foundIdxs,addElement,cls){
        let line = document.createElement('div');
        let highlightText = '';      
        //ここでハイライト化　<span class="diff-added">${word}</span>
        if(foundIdxs.length != 0){
            if(foundIdxs[0]["foundIdx"] == -1){
                line.className = "diff-line-" + cls;
            }
            else{
                let isHighlight = false;
                let inFoundIdx = false;
                for(let i = 0; i<text.length;i++){
                    inFoundIdx =false;
                    for(let j = 0; j < foundIdxs.length;j++){
                        if (i >=foundIdxs[j]["foundIdx"] && i < foundIdxs[j]["foundIdx"] + foundIdxs[j]["i"]){
                            inFoundIdx = true;
                            break;
                        }
                    }
                    if(inFoundIdx && isHighlight){
                        highlightText += highlightEnd;
                        isHighlight =false;
                    }
                    else if(!inFoundIdx && !isHighlight){
                        if(cls == 1){
                            highlightText += highlightStartClass1;
                        }
                        else if(cls == 2){
                            highlightText += highlightStartClass2;
                        }
                        else{
                            highlightText += highlightStartClass3;
                        }
                        isHighlight = true;
                    }
                    if(text[i] == ' '){
                        highlightText += '_';
                    }
                    else{
                        highlightText += text[i];                    
                    }
                }
                if(isHighlight){
                    highlightText += highlightEnd;
                }
            }
        }
        if(highlightText){
            line.innerHTML = highlightText;
        }
        else{
            line.innerHTML = "\u200b";
        }
        line.style.whiteSpace = "nowrap";
        addElement.appendChild(line);  
    }

    function updateLineNumbers(lines,lineNumberElement) {
        lineNumberElement.innerHTML = '';
        let index = 1;
        for (let i = 0; i < lines.length; i++) {
            const line = document.createElement('div');
            if(lines[i] == NewLineWord){
                line.textContent = '-';
            }
            else{
                line.textContent = index;
                index++;
            }
            lineNumberElement.appendChild(line);
        }
    }

    document.getElementById('diffButton').addEventListener('click', () => {
        getDiff();
    });

    function scrollLeft(){
        lineNumbers1.scrollTop = textEditor1.scrollTop;
        hiligtArea1.scrollTop = textEditor1.scrollTop;
        hiligtArea1.scrollLeft = textEditor1.scrollLeft;
        if(textEditor2.scrollTop != textEditor1.scrollTop){
            textEditor2.scrollTop = textEditor1.scrollTop;
        }
        if(textEditor2.scrollLeft != textEditor1.scrollLeft){
            textEditor2.scrollLeft = textEditor1.scrollLeft;
        }
    }
    function scrollRight(){
        lineNumbers2.scrollTop = textEditor2.scrollTop;
        hiligtArea2.scrollTop = textEditor2.scrollTop;
        hiligtArea2.scrollLeft = textEditor2.scrollLeft;
        if(textEditor1.scrollTop != textEditor2.scrollTop){
            textEditor1.scrollTop = textEditor2.scrollTop;
        }
        if(textEditor1.scrollLeft != textEditor2.scrollLeft){
            textEditor1.scrollLeft = textEditor2.scrollLeft;
        }
    }
    textEditor1.addEventListener('scroll', () => {
        scrollLeft();
        scollbarViewArea.style.top = parseInt(100 * textEditor1.scrollTop / textEditor1.scrollHeight) + '%';
    });
    textEditor2.addEventListener('scroll', () => {
        scrollRight();
        scollbarViewArea.style.top = parseInt(100 * textEditor1.scrollTop / textEditor1.scrollHeight) + '%';
    });
    textEditor1.addEventListener('input', () => {
        clearTimeout(diffExecuteTimer); 
        diffExecuteTimer = setTimeout(() => {
            getDiff();
        }, 1000);
    });
    textEditor2.addEventListener('input', () => {
        clearTimeout(diffExecuteTimer);
        diffExecuteTimer = setTimeout(() => {
            getDiff();
        }, 1000);
    });

    scrollbarArea.addEventListener('click', (e) => {
        const containerHeight = scrollbarArea.clientHeight;
        const clickY = e.clientY - e.currentTarget.getBoundingClientRect().top;
        const scrollTop = (clickY / containerHeight) * textEditor1.scrollHeight;

        leftScrollbar.scrollTop = scrollTop;
        textEditor1.scrollTop = scrollTop;
        scrollLeft();
    });

    textEditor1.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    });
    textEditor1.addEventListener('drop', (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                textEditor1.value = e.target.result;
            };
            reader.readAsText(file);
        }
    });
    textEditor2.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    });
    textEditor2.addEventListener('drop', (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                textEditor2.value = e.target.result;
            };
            reader.readAsText(file);
        }
    });



    getDiff();

};
