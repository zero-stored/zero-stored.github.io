
export function compressJson(json){
    // JSONデータを文字列に変換
    const jsonString = JSON.stringify(json);
    // 文字列をUTF-8バイト配列に変換
    const utf8Array = new TextEncoder().encode(jsonString);
    // GZIP圧縮
    const compressed = pako.gzip(utf8Array);
    // Base64エンコード
    const base64Encoded = btoa(String.fromCharCode.apply(null, new Uint8Array(compressed)));
    return base64Encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decompressJson(base64){
    // Base64デコード
    const base64Encoded = base64.replace(/-/g, '+').replace(/_/g, '/');
    const decodedData = atob(base64Encoded);
    const byteArray = new Uint8Array(decodedData.split("").map(char => char.charCodeAt(0)));
    // GZIP解凍
    const decompressed = pako.ungzip(byteArray, { to: 'string' });
    // JSONデータに変換
    return JSON.parse(decompressed);  
}

export function compressText(txt){
    // 文字列をUTF-8バイト配列に変換
    const utf8Array = new TextEncoder().encode(txt);
    // GZIP圧縮
    const compressed = pako.gzip(utf8Array);
    // Base64エンコード
    const base64Encoded = btoa(String.fromCharCode.apply(null, new Uint8Array(compressed)));
    return base64Encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decompressText(base64){
    // Base64デコード
    const base64Encoded = base64.replace(/-/g, '+').replace(/_/g, '/');
    const decodedData = atob(base64Encoded);
    const byteArray = new Uint8Array(decodedData.split("").map(char => char.charCodeAt(0)));
    // GZIP解凍
    const decompressed = pako.ungzip(byteArray, { to: 'string' });
    return decompressed;  
}
