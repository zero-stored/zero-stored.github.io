window.onload = function() {
    const binContainer = document.getElementById('binContainer');
    const binAddress = document.getElementById('binAddress');
    const binEditor = document.getElementById('binEditor');
    const binAscii = document.getElementById('binAscii');
    const toggleButton = document.querySelector('.toggle-button');
    const downloadButton = document.getElementById('downloadButton');
    const findHexInputBox = document.getElementById('findHexInputBox');
    const findTextInputBox = document.getElementById('findTextInputBox');
    const findWord = document.getElementById('findWord');
    const MAX_FILE_SIZE = 10*1024 * 1024; // 256KB
    
    let mode = 'overwrite';
    let selectId = '';
    let inputIndex = 0;
    let FoundHexIdx = [];
    let FoundTextIdx = [];
    const popup = document.getElementById('popup');
    document.getElementById('helpButton').addEventListener('click', function() { popup.style.display = 'block'; });
    document.getElementById('closeButton').addEventListener('click', function() { popup.style.display = 'none'; });
    const loadingPopup = document.getElementById('loadingPopup');

    let bytes = new Uint8Array(0);
    let filename = '';
   
    binContainer.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    });

    function makeEditor(){
        clear();
        let offset = 0;
        const length = bytes.length;
        while(offset < length){
            const addressBase = document.createElement("div");
            addressBase.className = "address";
            addressBase.innerText = offset.toString(16).padStart(8, '0');
            binAddress.appendChild(addressBase);
            const asciiLine = document.createElement("div");
            asciiLine.className = "ascii-line";
            const binLine = document.createElement("div");
            binLine.className = "bin-line";
            const separateDiv = document.createElement("div");
            separateDiv.className = "separate";
            for(let i = 0;i<16;i++){
                if(offset+i >= length){
                    break;
                }
                if(i ==8){
                    binLine.appendChild(separateDiv);
                }
                const binBase = document.createElement("div");
                binBase.className = "bin";
                binBase.innerText = bytes[offset + i].toString(16).padStart(2, '0');
                binBase.id = "bin-"+(offset+i)
                binBase.addEventListener('click', (event) => {
                    if(selectId != ''){
                        const befSelectBin = document.getElementById(selectId);
                        befSelectBin.className = "bin";
                        const befSelectAscii = document.getElementById(selectId.replace("bin-","ascii-"));
                        befSelectAscii.className = "ascii";
                    }
                    selectId = event.target.id;
                    binBase.className = "select-bin";
                    const newSelectAscii = document.getElementById(selectId.replace("bin-","ascii-"));
                    newSelectAscii.className = "select-ascii";
                    inputIndex = 0;
                });
                binLine.appendChild(binBase);
                const asciiBase = document.createElement("div");
                asciiBase.className = "ascii";
                asciiBase.id = "ascii-"+(offset+i)
                const char = String.fromCharCode(bytes[offset+i]);
                asciiBase.textContent = `${char === ' ' ? '.' : char}`;
                asciiLine.appendChild(asciiBase);
            }
            binEditor.appendChild(binLine);
            binAscii.appendChild(asciiLine);
            
            offset += 16;
        }
        binAddress.style.height = binContainer.scrollHeight+'px';
        binEditor.style.height = binContainer.scrollHeight+'px';
        binAscii.style.height = binContainer.scrollHeight+'px';
    }

    function asyncMakeEditor(){
        return new Promise((resolve, reject) => {
            try {
                makeEditor();
                resolve();         
            } catch (error) {
                reject(error);
            }
        });
    }   

    window.addEventListener('drop', async function(event) {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file.size > MAX_FILE_SIZE) {
          swal.fire({
              title: 'error',
              text :`File "${file.name}" is too large. Maximum size is 10MB.To be supported in the future`,
              icon: "error"
              });
          return;
        }
        filename = file.name;
        const reader = new FileReader();
        reader.onload = async function(e) {
            const arrayBuffer = e.target.result;
            bytes = new Uint8Array(arrayBuffer);
            loadingPopup.style.display = 'block';
            await new Promise(resolve => setTimeout(resolve, 100))
            await asyncMakeEditor();
            loadingPopup.style.display = 'none';
        };
        await reader.readAsArrayBuffer(file);
    });
    toggleButton.addEventListener('click', toggleMode);
    function toggleMode() {
        inputIndex = 0;
        switch (mode) {
            case 'overwrite':
                mode = 'insert'
              break;
            case 'insert':
                mode = 'overwrite'
                break;
            default:
          }
        toggleButton.textContent = `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
    }

    window.addEventListener('keydown', (event) => {
        if (findHexInputBox === document.activeElement || findTextInputBox  === document.activeElement)return;
        if (selectId == '')return;
        if (event.key === 'Delete') {
            deleteByte();
            return;
        }
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            inputArrow(event.key);
            return;
        }
        if(isNaN(parseInt(event.key,16)))return;
        if(!'0123456789abcdefABCDEF'.includes(event.key))return;
        switch (mode) {
            case 'overwrite':
                editOverwrite(event.key);
              break;
            case 'insert':
                editInsert(event.key);
                break;
            default:
          }
    });

    async function deleteByte(){
        const insertIndex = selectId.replace("bin-",'');
        const newArray = new Uint8Array(bytes.length - 1);
        newArray.set(bytes.slice(0, insertIndex), 0);
        newArray.set(bytes.slice(parseInt(insertIndex)+1),parseInt(insertIndex));
        bytes = newArray;    
        await makeEditor();
        inputIndex = 0;
        if(insertIndex >= bytes.length-1) {
            selectId = "bin-" + (bytes.length-1);
        }
        const selectBin = document.getElementById(selectId);
        selectBin.className = "select-bin";
        const newSelectAscii = document.getElementById(selectId.replace("bin-","ascii-"));
        newSelectAscii.className = "select-ascii";
    }

    function inputArrow(arrow){
        let insertIndex = parseInt(selectId.replace("bin-",''));
        switch(arrow){
            case 'ArrowUp':
                insertIndex -= 16;
                break;
            case 'ArrowDown':
                insertIndex += 16;
                break;
            case 'ArrowLeft':
                insertIndex -= 1;
                break;
            case 'ArrowRight':
                insertIndex += 1;
                break;
        }
        if(insertIndex <0)insertIndex =0;
        if(insertIndex > bytes.length-1) insertIndex = bytes.length-1;
        
        const befSelectBin = document.getElementById(selectId);
        befSelectBin.className = "bin";
        const befSelectAscii = document.getElementById(selectId.replace("bin-","ascii-"));
        befSelectAscii.className = "ascii";
        selectId = "bin-" + insertIndex;
        const newSelectBin = document.getElementById(selectId);
        newSelectBin.className = "select-bin";
        const newSelectAscii = document.getElementById(selectId.replace("bin-","ascii-"));
        newSelectAscii.className = "select-ascii";
    }

    function editOverwrite(key){
        const insertIndex = selectId.replace("bin-",'');
        const selectBin = document.getElementById(selectId);
        let textContent = selectBin.innerText;
        if(inputIndex == 0){
            textContent = key.toLowerCase() + textContent.slice(1);
        }
        else{
            textContent = textContent.slice(0,1) + key.toLowerCase();
        }
        bytes[insertIndex] = parseInt(textContent,16);
        const char = String.fromCharCode(bytes[insertIndex]);
        const selectAscii = document.getElementById(selectId.replace("bin-","ascii-"));
        selectAscii.textContent = `${char === ' ' ? '.' : char}`;

        selectBin.innerText = textContent;
        inputIndex++;
        if(inputIndex == 2){
            inputIndex = 0;
            selectBin.className = "bin";
            selectAscii.className = "ascii";
            selectId = "bin-" + (parseInt(selectId.replace("bin-",""))+1)
            const newSelectBin = document.getElementById(selectId);
            newSelectBin.className = "select-bin";
            const newSelectAscii = document.getElementById(selectId.replace("bin-","ascii-"));
            newSelectAscii.className = "select-ascii";
        }
    }

    async function editInsert(key){
        const insertIndex = selectId.replace("bin-",'');
        if(inputIndex == 0){
            const newArray = new Uint8Array(bytes.length + 1);
            newArray.set(bytes.slice(0, insertIndex), 0);
            newArray.set([parseInt(key, 16)], insertIndex);
            newArray.set(bytes.slice(insertIndex),parseInt(insertIndex)+1);
            bytes = newArray;
        }
        else{
            let targetByte = bytes[insertIndex];
            targetByte = parseInt(targetByte <<4) + parseInt(key, 16);
            bytes[insertIndex] = targetByte;
        }
        await makeEditor();
        inputIndex++;
        if(inputIndex == 2){
            inputIndex = 0;
            selectId = "bin-" + (parseInt(selectId.replace("bin-",""))+1)
        }
        const selectBin = document.getElementById(selectId);
        selectBin.className = "select-bin";
        const newSelectAscii = document.getElementById(selectId.replace("bin-","ascii-"));
        newSelectAscii.className = "select-ascii";
    }

    function clear(){
        binAddress.innerHTML = '';
        binEditor.innerHTML = '';
        binAscii.innerHTML = '';
    }

    downloadButton.addEventListener('click', () => {
        const blob = new Blob([bytes], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        if(filename == ''){
            link.download = 'edit.bin';
        }
        else{
            link.download = 'edit_' + filename;
        }
        link.click();
        link.remove();
    });

    function findHex(hexes){
        for(let i = 0;i<FoundHexIdx.length;i++){
            const findSelectBin = document.getElementById(FoundHexIdx[i]);
            findSelectBin.className = "bin";
        }
        FoundHexIdx = []
        let offset = 0;
        for(let i = 0; i<bytes.length;i++){
            if(hexes[offset] == bytes[i]){
                offset++;
                if(offset == hexes.length){
                    for(let j = i-offset+1; j<=i;j++){
                        const findSelectBin = document.getElementById("bin-"+j);
                        findSelectBin.className = "find-bin";
                        FoundHexIdx.push(("bin-"+j));
                    }
                }
            }
        else{
            offset=0;
        }
        }
    }

    findHexInputBox.addEventListener('input',(event)=>{
        const validHexRegex = /^[0-9a-fA-F]+$/;
        if (validHexRegex.test(findHexInputBox.value)) {
            let hexString = findHexInputBox.value;
            if (hexString.length % 2 !== 0) {
                hexString = hexString + '0';
            }
            const hexArray = hexString.match(/.{1,2}/g);
            let findArray = new Uint8Array(hexArray.map(hex => parseInt(hex, 16)));
            findHex(findArray);
            findWord.textContent = hexArray;
        } else if(findHexInputBox.value == '') {
            findWord.textContent = '';
            findHex([]);
        }
        else{
            findWord.textContent = 'Invalid input.';
            findHex([]);
        }
    });
    function findText(text){
        for(let i = 0;i<FoundTextIdx.length;i++){
            const findSelectText = document.getElementById(FoundTextIdx[i]);
            findSelectText.className = "ascii";
        }
        FoundTextIdx = []
        let offset = 0;
        for(let i = 0; i<bytes.length;i++){
            const char = String.fromCharCode(bytes[i]);
            if(text[offset] == `${char === ' ' ? '.' : char}`){
                offset++;
                if(offset == text.length){
                    for(let j = i-offset+1; j<=i;j++){
                        const findSelectBin = document.getElementById("ascii-"+j);
                        findSelectBin.className = "find-ascii";
                        FoundTextIdx.push(("ascii-"+j));
                    }
                }
            }
            else{
                offset=0;
            }
        }
    }

    findTextInputBox.addEventListener('input',(event)=>{
        findText(findTextInputBox.value);
    });
}



