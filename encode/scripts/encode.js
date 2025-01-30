
window.onload = function() {
    const normalText = document.getElementById('normalText');
    const urlText = document.getElementById('urlText');
    const base64Text = document.getElementById('base64Text');
    const base58Text = document.getElementById('base58Text');
    const base32Text = document.getElementById('base32Text');

    const popup = document.getElementById('popup');
    document.getElementById('helpButton').addEventListener('click', function() { popup.style.display = 'block'; });
    document.getElementById('closeButton').addEventListener('click', function() { popup.style.display = 'none'; });
    function seturl(){
        try{          
            urlText.value = encodeURIComponent(normalText.value);
        }catch (error){
            urlText.value = error;
        }
    }
    function setbase64(){
        try{          
            base64Text.value = btoa(normalText.value);
        }catch (error){
            base64Text.value = error;
        }
    }
    function setbase58(){
        try{          
            base58Text.value = base58.encode(normalText.value);
        }catch (error){
            base58Text.value = error;
        }
    }
    function setbase32(){
        try{          
            base32Text.value = base58.encode(normalText.value);
        }catch (error){
            base32Text.value = error;
        }
    }
    function seturlError(){   
        urlText.value =  "error";
    }
    function setbase64Error(){
        base64Text.value = "error";
    }
    function setbase58Error(){
        base58Text.value =  "error";
    }
    function setbase32Error(){
        base32Text.value = "error";
    }
    normalText.addEventListener('input', () => {
        seturl();
        setbase64();
        setbase58();
        setbase32();
    });
    urlText.addEventListener('input', () => {
        try{
            normalText.value = decodeURIComponent(urlText.value);
            setbase64();
            setbase58();
            setbase32();
        }
        catch(error){
            normalText.value = error;
            setbase64Error();
            setbase58Error();
            setbase32Error();
        }
    });
    base64Text.addEventListener('input', () => {
        try{
            normalText.value = atob(base64Text.value);
            seturl();
            setbase58();
            setbase32();
        }
        catch(error){
            normalText.value = error;
            seturlError();
            setbase58Error();
            setbase32Error();
        }
    });
    base58Text.addEventListener('input', () => {
        try{
            normalText.value = base58.decode(base58Text.value);
            seturl();
            setbase64();
            setbase32();
        }
        catch(error){
            normalText.value = error;
            seturlError();
            setbase64Error();
            setbase32Error();
        }
    });
    base32Text.addEventListener('input', () => {
        try{
            normalText.value = base32.decode(base32Text.value);
            seturl();
            setbase64();
            setbase58();
        }
        catch(error){
            normalText.value = error;
            seturlError();
            setbase64Error();
            setbase58Error();
        }
    });
    seturl();
    setbase64();
    setbase58();
    setbase32();
};

