
window.onload = function() {
    const normalText = document.getElementById('normalText');
    const md5Text = document.getElementById('md5Text');
    const sha1Text = document.getElementById('sha1Text');
    const sha224Text = document.getElementById('sha224Text');
    const sha256Text = document.getElementById('sha256Text');
    const sha384Text = document.getElementById('sha384Text');
    const sha512Text = document.getElementById('sha512Text');
    const hmacSwitch = document.getElementById('hmacSwitch');
    const hmacText = document.getElementById('hmacText');

    const popup = document.getElementById('popup');
    document.getElementById('helpButton').addEventListener('click', function() { popup.style.display = 'block'; });
    document.getElementById('closeButton').addEventListener('click', function() { popup.style.display = 'none'; });

    normalText.addEventListener('input', (event) => {
        if(hmacSwitch.checked){
            getHashHMAC(event.target.value,hmacText.value);
        }
        else{
            getHash(event.target.value);
        }
    });
    hmacText.addEventListener('input', (event) => {
        getHashHMAC(normalText.value,event.target.value);
    });

    function getHash(text){
        md5Text.textContent = CryptoJS.MD5(text).toString();
        sha1Text.textContent = CryptoJS.SHA1(text).toString();
        sha224Text.textContent = CryptoJS.SHA224(text).toString();
        sha256Text.textContent = CryptoJS.SHA256(text).toString();
        sha384Text.textContent = CryptoJS.SHA384(text).toString();
        sha512Text.textContent = CryptoJS.SHA512(text).toString();
    }
    function getHashHMAC(text,secretKey){
        md5Text.textContent = CryptoJS.HmacMD5(text, secretKey).toString();
        sha1Text.textContent = CryptoJS.HmacSHA1(text, secretKey).toString();
        sha224Text.textContent = CryptoJS.HmacSHA224(text, secretKey).toString();
        sha256Text.textContent = CryptoJS.HmacSHA256(text, secretKey).toString();
        sha384Text.textContent = CryptoJS.HmacSHA384(text, secretKey).toString();
        sha512Text.textContent = CryptoJS.HmacSHA512(text, secretKey).toString();
    }

    hmacSwitch.addEventListener('change', function() {
        if (hmacSwitch.checked) {
            hmacText.style.backgroundColor = 'white';
            hmacText.removeAttribute('readonly');
            getHashHMAC(normalText.value,hmacText.value);
        } else { 
            hmacText.style.backgroundColor = 'gray';
            hmacText.setAttribute('readonly', 'readonly'); 
            getHash(normalText.value);
        } 
    });
    
    
    getHash(normalText.value);


};
