# \<fs-cache\>

[![Code Climate](https://codeclimate.com/repos/5851aead9e1f95008d004303/badges/7fa2d73c46bc33a5d48f/gpa.svg)](https://codeclimate.com/repos/5851aead9e1f95008d004303/feed) [![Test Coverage](https://codeclimate.com/repos/5851aead9e1f95008d004303/badges/7fa2d73c46bc33a5d48f/coverage.svg)](https://codeclimate.com/repos/5851aead9e1f95008d004303/coverage) [![Issue Count](https://codeclimate.com/repos/5851aead9e1f95008d004303/badges/7fa2d73c46bc33a5d48f/issue_count.svg)](https://codeclimate.com/repos/5851aead9e1f95008d004303/feed) [![Build Status](https://travis-ci.com/fs-webdev/fs-cache.svg?token=WUXxpezanxE53AS27xNg&branch=master)](https://travis-ci.com/fs-webdev/fs-cache)

## Intro

This component is a wrapper for a third-party caching library that can be added to any component requiring cache access. Currently utilizes [localforage](https://github.com/localForage/localForage).

## localforage

localforage is an asynchronous key value store with namespacing capabilites. It has the same api as `localStorage`, but everything returns a promise and you can specify a namespace 2 layers deep. It also lets you choose what storage type from `sessionStorage`, `localStorage`, `webSQL`, and `indexedDB`.

## fs-cache

While it uses localforage under the hood, `fs-cache` includes a small utility library that adds some defaults when working with `localforage` instances as well as clearing cache of all `localforage` data stores, a biweekly cache cleanup, and data encryption/decryption. It also includes a `Polymer` behavior to easily create and get at data stores from your web components.

### JS API

`FS.cache` is the global object.

#### .instance(config)

To get a handle on a key value store at a certain namespace, you call `FS.cache.instance` (this is the only synchronous function) it calls `localforage.createInstance` with a few defaults and returns a localforage instance.

It can be called with no arguments and will defaults to a namespace of `{user's cisId}/fs`.

##### config

    {
      dbName: 'db', //first level namespace (default user's cisId)
      storeName: 'store', // second level namespace
      storeVersion: 3, // version of store
      type: 'local', //storage type (see below)
      size: 450000, //size of db (non-local/session storage types)
      lifetime: 'hour' // how long cache should live. max is 'twoWeeks'
    }

You can set the `storageType` to `local` for `localStorage`, `session` for `sessionStorage`. It defaults to `indexedDB`.

##### Namespacing and Defaults

Namespacing is set by the `dbName/storeName`. `dbName` defaults to `cisId` if `FS.User.profile.cisId` exists on the page or `fs`. `storeName` defaults to `fs`. You should usually pass in a `storeName`.

#### .clearAll()

Returns a `promise`. It clears anything created through `FS.cache.instance`.

#### .deleteAll()

Deletes anything created through `FS.cache.instance`. Mainly, it's to delete all `indexedDB` databases.

#### . periodicClear()

This is called automatically every time the component is loaded. If 2 weeks has passed, it calls `FS.cache.clearAll()`

### Data API

Calling `FS.cache.instance()` returns a localforage instance (key value store at a certain namespace). You'll get everything the [localforage](/localforage/localforage)'s [data api](https://localforage.github.io/localForage/#data-api) gives you. Plus `.getEncrypted` and `.setEncrypted`.

#### .getEncrypted(key)

Behaves exactly the same as `.getItem`, but the stored value is run through a decryption function.

#### .setEncrypted(key, value)

Behaves exactly the same as `.setItem`, but the value is run through an encryption function.

## Utilization

Import the component.

```html
<link rel="import" href="../fs-cache/fs-cache.html">
```

Import the component with encryption.

```html
<link rel="import" href="../fs-cache/fs-crypto.html">
<link rel="import" href="../fs-cache/fs-cache.html">
```

From a JavaScript file:

```javascript
var storeName = 'persons';
var _cache = FS.cache.instance({storeName});
var _sessionCache = FS.cache.instance({storeName, type:'session'});

// indexedDB instance
_cache.getItem('KWDY-6RW')
  .then(function(person){
    // do stuff
  })

// sessionStorage instance
_sessionCache.getItem('KWDY-6RW')
  .then(function(person){
    // do stuff
  })
```

From Polymer:

```html
<fs-cache store-name="demo" type="session" cache="{{sessionCache}}"></fs-cache>
<fs-cache-item key="theKey" value="{{theValue}}" cache="{{sessionCache}}"></fs-cache-item>
<script>
Polymer({
  ...
  _doSomething: function(e){
    this.theValue = 'things';
  }
  ...
})
</script>
```

You can then get and set values via `_cache.getItem(key)` and `_cache.setItem(key, value)`.

## Handling Errors

`.setItem` will throw an error with a code of `22` if user is out of storage space. You'll need to tell the user they're out of storage to clear it up.

## Running the element locally

### Install Frontier CLI

First, make sure you have the [Frontier CLI](https://www.github.com/fs-webdev/frontier-cli) installed. Follow the instructions in the readme to install.

### Viewing Your Element

```bash
frontier element serve --env beta -o
```

You should see an output indicating a URL at which your element is being served.

**NOTE: This server is an extension of the default `polymer serve` command available in the Polymer CLI. The only difference is that this server proxies all FamilySearch API URLs**

## Running Tests

This component is set up to be tested via [web-component-tester](https://github.com/Polymer/web-component-tester).

In order to run the `wct` command, you need to globally install web-component-tester:

> NOTE OF WARNING: This component is using a [patcharound](https://github.com/thedeeno/web-component-tester-istanbul/issues/38#issuecomment-287544522) in order to incorporate code coverage reporting. In order to be able to run unit tests locally, (as of 2017-05-18) you must install the *patched* versions of web-component-tester and web-component-tester-istanbul. (You may need to uninstall other versions, first)

```bash
npm install -g t2ym/web-component-tester#6.0.0-wct6-plugin.1
npm install -g t2ym/web-component-tester-istanbul#0.10.1-wct6.11
```

To run tests locally, run:

```bash
wct --skip-plugin sauce
```

If you need to debug locally (keeping the browser open), run:

```bash
polymer test --skip-plugin sauce --local chrome -p
```

If you want to run the full suite of SauceLabs browser tests, run:

```bash
wct test/index.html --configFile wct.conf.json  --sauce-username {USERNAME} --sauce-access-key {ACCESS_KEY}
```
