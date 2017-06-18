(function(){
  var cache = {
    stores: {}
  };
  var dbSaveQueue = [];
  var dbSaving = false;
  var failSafeCalled = false;
  var dbCache = localforage;

  if (typeof FS == "undefined") {FS = {};}

  FS.cache = cache;

  var hour = 1000*60*60;
  var day = hour*24;
  var week = day*7;
  var twoWeeks = week*2;

  var lifetimes = {
    hour: hour,
    day: day,
    week: week,
    twoWeeks: twoWeeks
  };

  // set up session storage driver since localforage doesn't ship with it
  localforage.defineDriver(sessionStorageWrapper);

  /**
   * Creates a loccalforage instance and returns it with some defaults set.
   * @param {Object} config - config for cache creation
   * @param {string} config.dbName Top level namespace for cache. defaults to helpee's cisId, cisId or fs (probably shouldn't define this)
   * @param {string} config.storeName Second level namespace for cache. Should always be defined
   * @param {string|Number} config.storeVersion version for store
   * @param {string} config.lifetime Defines how long cache should live. 'hour', 'day', 'week', 'twoWeeks', or a number in milliseconds
   * @param {string} config.type Defines store type. 'local' for localStorage, 'session' for sessionStorage, defaults to indexedDB
   * @param {string} config.size Defines db size. defaults to 4500000 (4.5MB)
   * @returns {Object} localforage instance
   */
  cache.instance = function(config){
    var that = this;

    /**
     * Setup config object
     */
    config = config || {};

    /**
     * Setup Lifetime
     */
    var lifetime = lifetimes.twoWeeks;
    // parse lifetime from 'hour', 'day', 'week', 'twoWeeks'
    if(config.lifetime && typeof config.lifetime === 'string' && lifetimes[config.lifetime]){
      lifetime = lifetimes[config.lifetime];

    // parse lifetime from number in milliseconds
  } else if (config.lifetime && !Number.isNaN(parseInt(config.lifetime, 10))){
      lifetime = parseInt(config.lifetime, 10);
    }


    /**
     * Setup cis Id
     */
    var cisId;

    // cisId from FS.User object is helpee's id in helper mode
    if(window.FS && window.FS.User && FS.User.getId && FS.User.getEffectiveId){
      cisId = (config.ignoreHelper) ? FS.User.getId() : FS.User.getEffectiveId();
    }


    /**
     * Setup dbName from config or cisId
     */
    var dbName = config.dbName || cisId ||  'fs';

    if(!isValidDBName(dbName)){
      dbName = generateDBName(dbName, 1);
    }

    /**
     * Setup storeName from config
     */
    var storeName = config.storeName || 'fs';
    // Only allow letters, numbers and underscore in storeName (safari bug)
    if(!/^[a-z0-9_]+$/i.test(storeName)){
      throw new Error('Only letters, numbers or _ in storeName');
    }

    /**
     * Setup size from config or default to 4.5MB (to prevent safari bug)
     */
    var size = config.size || 4500000;


    /**
     * Setup store version
     */
    if(config.storeVersion){
      storeName+='__'+config.storeVersion;
    }

    /**
     * aggregate config
     */
    var dbConfig = {
      name: dbName,
      storeName: storeName,
      lifetime: lifetime,
      size: size,
      driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE]
    };

    /**
     * Overraide storage type
     */
    if(config.type === 'local'){
      dbConfig.driver = localforage.LOCALSTORAGE;
    }
    if(config.type === 'session'){
      dbConfig.driver = sessionStorageWrapper._driver;
    }

    /**
     * save db config for later clearing
     */
    _saveDB(dbConfig)
      .then(function(){
        return that.periodicClear();
      })
      .then()
      .catch(_sendLog);

    /**
     * create instance and save to FS.cache object for debugging
     */
    this.stores[storeName] = localforage.createInstance(dbConfig);

    /**
     * Add crypto to instance if loaded
     */
    if(window.FS && window.FS.crypto){
      this.stores[storeName].setEncrypted = setEncrypted;
      this.stores[storeName].getEncrypted = getEncrypted;
    }

    /**
     * Wrap get/setItem for splunk error logging
     */

    this.stores[storeName].__setItem = this.stores[storeName].setItem;
    this.stores[storeName].__getItem = this.stores[storeName].getItem;
    this.stores[storeName].setItem = setItem;
    this.stores[storeName].getItem = getItem;

    /**
     * When new drivers get set, we need to wrap the get/setItem functions.
     */
    Object.defineProperty(this.stores[storeName], 'getItem', {
      get: function() { return getItem; },
      set: function(g) {this.__getItem = g; }
    });
    Object.defineProperty(this.stores[storeName], 'setItem', {
      get: function() { return setItem; },
      set: function(s) {this.__setItem = s; }
    });

    failSafe(this.stores[storeName]);

    /**
     * Return localforage instance
     */
    return this.stores[storeName];
  };

  /**
   * Runs through all caches created by FS.cache.instance and clears them.
   * @returns {Promise}
   */
  cache.clearAll = function(){
    var databases;
    return dbCache.getItem('DBs')
      .then(function(dbs){
        if(!dbs || !dbs.length){
          console.warn('No Databases.');
          return [];
        }
        databases = dbs;
        var promises = [];
        var storeNames = [];
        dbs.forEach(function(db){
          var store = localforage.createInstance(db);
          storeNames.push(db);

          promises.push(store.clear());
        });

        return Promise.all(promises);

      })
      .then(function(results){
        if(results.length){
          results.forEach(function(store, i){
            console.info(JSON.stringify(databases[i])+' cleared');
          });
        }
        console.info('ALL CLEAR');

        return databases;
      });
  };

  /**
   * Runs through all caches created by FS.cache.instance and deletes them.
   * (runs indexedDB.deleteDatabase for each)
   * @returns {Promise}
   */
  cache.deleteAll = function(){
    var that = this;
    return this.clearAll()
      .then(function(dbs){
        if(!dbs || !dbs.length){
          throw new Error('No databases exist');
        }

        // filter out non indexedDB instances
        dbs = dbs.filter(function(db){
          return (db.driver.indexOf(localforage.INDEXEDDB) !== -1);
        });

        if(dbs.length){
          dbs.forEach(function(db){
            try {
              indexedDB.deleteDatabase(db.name);
              console.info(db.name+' was deleted');
            } catch(e){
              console.warn(db.name+' was not deleted properly');
            }
          });
        }

        return dbCache.clear();
      })
      .then(function(){
        console.info('ALL DELETED');
        return 'ALL DELETED';
      });

  };

  /**
   * Convenience function for indexedDB.deleteDatabase
   * @param {string} dbName - required name to delete
   */
  cache.deleteDB = function(dbName){
    if(!dbName){
      throw new Error('Must pass dbName');
    }
    indexedDB.deleteDatabase(dbName);
    console.info(dbName + ' DELETED');
  };

  /**
   * A function that gets called everytime this file loads that checks
   * the last time cleared and if it's been over two weeks, clear out all data
   * @returns {Promise}
   */
  cache.periodicClear = function(){
    var that = this;
    var now = new Date();
    return Promise.all([
      dbCache.getItem('DBs'),
      dbCache.getItem('lastTimesCleared')
    ])
    .then(function(results){
      var dbs = results[0];
      var lastTimesCleared = results[1] || {};
      var promises = [];
      if(dbs && dbs.length){
        dbs.forEach(function(db){
          var lastTimeCleared = lastTimesCleared[db.id];
          if(!lastTimeCleared){
            lastTimesCleared[db.id] = now;
          } else if(now-lastTimeCleared > db.lifetime){
            var instance = localforage.createInstance(db);
            promises.push(instance.clear());
            lastTimesCleared[db.id] = now;
          }
        });
        promises.push(dbCache.setItem('lastTimesCleared', lastTimesCleared));
        return Promise.all(promises);
      }
    })
    .then(function(results){
      return results;
    })
  }

  cache.periodicClear()
    .then()
    .catch(_sendLog);

  /**
   * A method that gets set on the localforage instance returned from
   * FS.cache.instance for setting encrypted data
   */
  var setEncrypted = function(key, value){
    console.warn('ENCRYPTION IS COMPLETELY EXPIRIMENTAL. DON\'T USE FOR ANYTHING IMPORTANT.')
    var that = this;
    return FS.crypto.encrypt(value)
      .then(function(encryptedValue){
        return that.setItem(key, encryptedValue);
      });
  }

  /**
   * A method that gets set on the localforage instance returned from
   * FS.cache.instance for getting encrypted data
   */
  var getEncrypted = function(key){
    console.warn('ENCRYPTION IS COMPLETELY EXPIRIMENTAL. DON\'T USE FOR ANYTHING IMPORTANT.')

    return this.getItem(key)
      .then(function(encryptedValue){
        return FS.crypto.decrypt(encryptedValue);
      })
  }

  /**
   * A wrapper method so we can log errors to splunk
   */
  var setItem = function(key, value){

    var that = this;

    return new Promise(function(resolve, reject){
      var setItemTimout = setTimeout(function(){
        console.warn('setItem timed out');
        resolve(value);
      },1500);

      that.__setItem(key, value)
        .then(function(data){
          clearTimeout(setItemTimout);
          resolve(data);
        }).catch(function(err){
          clearTimeout(setItemTimout);
          reject(err);
          _sendLog(err);
        });
    });
  }


  /**
   * A wrapper method so we can log errors to splunk
   */
  var getItem = function(key){

    var that = this;

    return new Promise(function(resolve, reject){
      var getItemTimout = setTimeout(function(){
        console.warn('getItem timed out');
        resolve(null);
      },1500);

      that.__getItem(key)
        .then(function(data){
          clearTimeout(getItemTimout);
          resolve(data);
        }).catch(function(err){
          clearTimeout(getItemTimout);
          reject(err);
          _sendLog(err);
        });
    });

  }

  /**
   * A method that sends error logs to splunk
   * @param {Error} e
   */
  var _sendLog = function(e, id){
    if(FS.metric){
      var log = {
        message: e && e.message,
        name: e && e.name,
        code: e && e.code,
        appName: FS.appName,
        url: window.location.href,
        env: FS.targetEnv
      };
      if(id){
        log.id = id;
      }
      var browser = FS.Browser.uaMatch();
      log.version = browser.version;
      log.browser = browser.browser;

      FS.metric.count('FS.cache.err', 1, log);
    }

    /**
     * Quota Exceeded Errors
     *
     * iOS Safari 10.2 throws SQLError
     * {
     *   message: "there was not enough remaining storage space, or the storage quota was reached and the user declined to allow more space"
     *   code: 4
     * }
     *
     * Firefox 51 throws DOMError
     * {
     *   message: "The current transaction exceeded its quota limitations.",
     *   name: "QuotaExceededError"
     * }
     *
     * Safari 10 throws a null error. Real cool safari
     * null
     *
     * Chrome 56 throws DOMException
     * {
     *   code: 22,
     *   name: "QuotaExceededError"
     * }
     *
     */

    var quota = e && e.message || e && e.name;

    if(e === null || e && e.code === 22 || (quota && quota.toLowerCase().indexOf('quota') !== -1)){
      function QuotaExceededError(message) {
        this.name = 'StorageQuotaExceeded';
        this.code = 22;
        this.message = message || 'Storage Quota Exceeded';
        this.stack = (new Error()).stack;
      }
      QuotaExceededError.prototype = Object.create(Error.prototype);
      QuotaExceededError.prototype.constructor = QuotaExceededError;

      throw new QuotaExceededError();
    } else {
      throw e;
    }
  }
  /**
   * Saves a unique list of all localforage instances created
   * through FS.cache.instance so we can clear/delete them later
   * @param {Object} config
   * @returns {Promise}
   */
  var _saveDB = function(config){
    if(dbSaving){
      dbSaveQueue.push(config);
      return Promise.resolve();
    }
    dbSaving = true;
    return dbCache.getItem('DBs')
      .then(function(result){
        var dbs = result || [];
        var inCache = dbs.filter(function(db){
          var tempDb = {storeName:db.storeName, driver:db.driver, dbName:db.dbName};
          var tempConfig = {storeName:config.storeName, driver:config.driver, tempConfigName:config.dbName};

          return JSON.stringify(tempDb) === JSON.stringify(tempConfig);
        });

        if(!inCache.length){
          config.id = uuid();
          dbs.push(config);
        } else {
          dbs.forEach(function(db){
            if(db.id === inCache[0].id){
              db.lifetime = config.lifetime;
            }
          });
        }

        return dbCache.setItem('DBs', dbs);
      })
      .then(function(){
        dbSaving = false;
        if(dbSaveQueue.length){
          var db = dbSaveQueue.shift();
          return _saveDB(db);
        }

        return;
      })
      .catch(function(err){
        dbSaving = false;
        _sendLog(err);
      });
  };

  /**
   * Failsafe if indexedDB gets corrupted
   *
   */
  function failSafe(db){

    function handleFailSafe(){
      if(isValidDBName(this._config.name)){
        var dbs = FS && FS.sessionStorage && FS.sessionStorage.get('FAILED_DBS') || [];
        dbs.push(this._config.name);
        FS && FS.sessionStorage && FS.sessionStorage.set('FAILED_DBS',dbs);
        _sendLog(new Error('DB didn\'t respond within 3 seconds.'), hash(this._config.name));
      }
    }

    // if db isn't ready within 3 seconds, browser needs to be restarted.
    var dbReadyTimout = setTimeout(handleFailSafe.bind(db), 3000);

    // if db gets ready within 3 seconds, clear timeout
    db.ready()
      .then(function(r){
        clearTimeout(dbReadyTimout);
      })
      .catch(_sendLog);
  }

  var uuid = function uuid(a) {
    return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid);
  };

  var isValidDBName = function(dbName){
    var failedDbs = FS && FS.sessionStorage && FS.sessionStorage.get('FAILED_DBS') || [];
    return failedDbs.indexOf(dbName) === -1;
  }
  var generateDBName = function(name, i){
    var tempName = name+'__'+i;
    if(isValidDBName(tempName)){
      return tempName;
    }
    i++;
    return generateDBName(name, i);
  }

  var hash = function(s){
    return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
  }

  Number.isNaN = Number.isNaN || function(value) {
    return value !== value;
  }
})();
