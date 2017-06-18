(function(){
  var crypt = {};

  if (typeof FS == "undefined") {FS = {};}
  FS.crypto = crypt;

  // Huge TODO: Talk to core and security about all of this key stuff
  var vector = new Uint8Array(16);
  var config = {
    name: "AES-CBC",
    iv: vector
  };
  var password = "password";
  var key = null;

  crypto.subtle.digest({
    name: "SHA-256"
  }, convertStringToArrayBufferView(password)).then(function(result) {
    window.crypto.subtle.importKey("raw", result, {
      name: "AES-CBC"
    }, false, ["encrypt", "decrypt"]).then(function(e) {
      key = e;
    }, function(e) {
      console.log(e);
    });
  });

  /**
   * Encrypts the data passed into it.
   * @param {any} data
   * @returns {Promise}
   */
  crypt.encrypt = function(data){
    if(!data){
      return Promise.resolve(null);
    }

    console.time('encrypt');
    return crypto.subtle.encrypt(config, key, convertStringToArrayBufferView(data))
      .then(function(result) {
        encrypted_data = new Uint8Array(result);
        console.timeEnd('encrypt');

        return encrypted_data;
      })
  };

  /**
   * Decrypts the data passed into it.
   * @param {any} data
   * @returns {Promise}
   */
  crypt.decrypt = function(data){

    if(!data){
      return Promise.resolve(null);
    }

    console.time('decrypt');
    return crypto.subtle.decrypt(config, key, data)
      .then(function(result) {
        var decrypted_data = new Uint8Array(result);
        var decryptedString = convertArrayBufferViewtoString(decrypted_data);
        console.timeEnd('decrypt');

        return decryptedString;
      });
  };

  function convertStringToArrayBufferView(data) {
    if(typeof data !== 'string'){
      data = JSON.stringify(data);
    }
    var bytes = new Uint8Array(data.length);
    // Making for loop for ie 11
    for (var i = 0; i < bytes.length; i++) {
      bytes[i] = data.charCodeAt(i);
    }
    return bytes;
  }

  function convertArrayBufferViewtoString(buffer) {
    var data = "";
    // Making for loop for ie 11
    for (var i = 0; i < buffer.length; i++) {
      data += String.fromCharCode(buffer[i]);
    }

    try {
      data = JSON.parse(data);
    } catch(e){}

    return data;
  }
})();
