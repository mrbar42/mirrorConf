# MirrorConf

MirrorConf is a small helper object that let you mirror a regular object to localStorage in the background.
Every time a top level property is set a background save task is initiated. 
Mirror conf uses the 'onbeforeunload' event to save final version of the data.

even if the user empties localStorage manually - upon leaving the page it will be saved again.
the only ways to get rid of the persistence is to externally remove the localStorage of the domain or to invoke `.destroy()` or `clearMirrors()` 



If you encounter a bug or you have a suggestion - create an issue or submit a pull request

## Quick Examples

```js
    // get mirror
    var store = getMirror('userPreferences');
    
    console.log('Saved color', store.favoriteColor); // logs undefined on first load and 'red' on consecutive reloads
    
    // save item using the 'setItem' method
    store.setItem('favoriteColor', 'blue');
    console.log(store.favoriteColor); // logs 'blue'

    // update item using regular inline object syntax
    store.favoriteColor = 'red';
    console.log(store.favoriteColor); // logs 'red'

    
    // get reference once again
    console.log(getMirror('userPreferences').favoriteColor); // logs 'red'
    
    // different store doesn't share properties
    console.log(getMirror('anotherStore').favoriteColor); // logs undefined
```


## Usage

### getMirror([name] [, opt]) 

Create a new store or get reference if it already exists.

__Arguments__

* `name(optional)` - String, Unique name of the store - Default: 'Default'.
* `opt(optional)` - Dictionary of options.
* `opt.freshStart` - Boolean, Don't load data from disk. instead start new empty store and overwrite existing.

returns an instance of MirrorStore.

__Examples__

```js
var store = getMirror();
store.setItem('favoriteColor', 'blue');

var sameStore = getMirror('Default');
sameStore.favoriteColor; // returns 'blue'

var anotherStore = getMirror('myDifferentStore');
anotherStore.favoriteColor; // returns undefined

```


### clearMirrors() 

Remove all saved MirrorStore from localStorage.
This will NOT remove stores that are currently initiated (e.g. were declared with `getMirror()`)

__Examples__

```js
var store = getMirror();
store.setItem('favoriteColor', 'blue');

clearMirrors();

// already declared stores are not affected
store.favoriteColor; // returns 'blue'
```



## Methods

### MirrorStore.setItem(key, value) 

Adds a property with the given key.
Its recommended to initiate a property by using setItem and then use inline regular object setter (e.q `store.myKey = 'myVal'`); 

__Arguments__

* `key` - key to use as property name.
* `value` - The value to assign to the new property.

---------------------------------------

### MirrorStore.getItem(key) 

Get property value. 

__Arguments__

* `key` - key to lookup.

__Examples__

```js
store.setItem('favoriteColor', 'blue');

store.getItem('favoriteColor'); // returns 'blue'
// same as
store.favoriteColor; // returns 'blue'
```

---------------------------------------

### MirrorStore.removeItem(key) 

Remove property from store. 

__Arguments__

* `key` - key to be removed.

__Examples__

```js
store.setItem('favoriteColor', 'blue');

store.removeItem('favoriteColor');
// same as
delete store.favoriteColor;
 
store.favoriteColor; // returns undefined
```

---------------------------------------


### MirrorStore.clear() 

Empties the store from all of its properties but leaves the store intact and usable.

__Examples__

```js
var store = getMirror('myStoreName');

store.setItem('favoriteColor', 'blue');

store.clear();

store.setItem('favoriteColor', 'green');

var store2 = getMirror('myStoreName');

store2.favoriteColor; // returns 'green'
```

---------------------------------------


### MirrorStore.destroy() 

Destroys the store both from memory and localStorage.
The store will not be usable after invoking this method. 

__Examples__

```js
var store = getMirror('myStoreName');

store.setItem('favoriteColor', 'blue');

store.destroy();

var store2 = getMirror('myStoreName');

store2.favoriteColor; // returns undefined
```

---------------------------------------


### MirrorStore.save(callback) 

Trigger save to localStorage.
This method is also used internally to trigger save upon changes.
This will not actually save the data, but trigger a future save in background.
There for, calling this method many times will be debounced and perform only one actual save.
There is not need to use this method unless you are doing deep object nesting and want to make sure data is saved.


__Arguments__

* `callback()` - A callback which is called when the data was actually saved to localStorage

__Examples__

```js
var store = getMirror('myStoreName');

store.notifications = []

// pseudo server function
fetchNotification(function (array) {
    store.notifications.push(array);
})

store.save();
```