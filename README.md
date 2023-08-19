# @OpenDB

# IMPORTANT! The package is a pre-release, it's not finished, it shouldn't be used yet.

> Documentation: [OpenDB Docs](https://printfdead.github.io/opendb/index.html) (Decrepated)
# Information:
- :wrench: Efficient and fast database using BSON.
- :butterfly: Simple and easy to use
- :smile: Version 2.4

# Installation
```sh
npm i open.db --save
```

# Examples:
- `Create Database & Start Client Instance:`
```ts
import { Client } from 'open.db';

/**
 * @param {object} options - Put database name and path
 * @new Client({ Path: string });
 * @description Instance new Client for create new database or use a database.
 */
const OpenDB = new Client({ Path: "path/to/root/folder" });

/** 
 * @param {string} event - Event name
 * @param {function} callback - Callback function
 * @description The event is emitted when the Client class is instantiated.
*/
OpenDB.on('start', () => {
  console.log("AjaxDB start!");
});

/** 
 * @param {string} event- Event name
 * @param {function} callback - Callback error.
 * @type {error} ErrorClient interface
 * @description The event is emitted on some conditions of the Database class.
*/
OpenDB.on('error', (error) => {
  console.error(error);  
});

// Other conditions instantiate the Error clas and stop the database
```
### Note:
- **Path:** must not start with dot (".", except two dots, EJ: "..") or slashes (/, \) or end in slash
---
- `Start`
```ts
/**
 * @description Create the root folder (database container)
 * @return Promise<this>
 */

await OpenDB.Start();
```
#### Errors:
- (ODB-01) **The path you specified was not found.** This error is due to the specified path not being found or misplaced.
- (ODB-99) **An error occurred and the path was not specified.** This error can occur because the path could not be defined automatically or for other internal reasons.
#### Warns:
- (Warn-01) **The root folder already exists, nothing will be created and this function will be skipped.** This warn is because the root folder already exists, it will not affect the code but it will warn that it already exists, so you can delete the 'Start()' function from the code
---
- `CreateDatabase`
```ts
/**
 * @param {string} Name - Database name
 * @description Create the database
 * @return Promise<this>
 */

await OpenDB.CreateDatabase("DatabaseName");
```
#### Errors:
- (ODB-01) **The path you specified was not found.** This error is due to the specified path not being found or misplaced.
- (ODB-02) **The database root folder not exists.** This error is due to the root folder (OpenDB/) not being found.
#### Warns:
- (Warn-02) **The database already exists.** This is because the database already exists, it will not do anything, the function will be skipped.
---
- `SetDatabase`
```ts
/**
 * @param {string} Name - Database name
 * @param {boolean} Force - (optional) Force change
 * @param {boolean} NotLoad - (optional) Don't preload pointers and containers, defaults to false.
 * @description Select the database
 * @return this
 */

OpenDB.SetDatabase("DatabaseName");
```
#### Errors:
- (ODB-01) **The path you specified was not found.** This error is due to the specified path not being found or misplaced.
- (ODB-03) **This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.** This error is because the database is not created.
- (ODB-02) **The database root folder not exists.** This error is due to the root folder (OpenDB/) not being found.
- (ODB-04) **If force is not activated, the name of the database cannot be changed.** This is because the database name is already specified, and 'Force' must be set to true to be able to change it.
#### Warns:
- (Warn-03) **This can cause loading times to increase significantly.** it is because 'NotLoad' is true
---
- `CreatePointer`
```ts
/**
 * @param {String | Number} Reference - A reference to search faster
 * @description Create Pointer
 * @return this
 */

await OpenDB.CreatePointer<string>("PointerReference");
```
#### Errors:
- (ODB-01) **The path you specified was not found.** This error is due to the specified path not being found or misplaced.
- (ODB-03) **This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.** This error is because the database is not created.
- (ODB-02) **The database root folder not exists.** This error is due to the root folder (OpenDB/) not being found.
#### Warns:
- (Warn-04) **A pointer with this reference already exists, the pointer will not be created.** This is because the pointer with the same reference already exists, it will not give an error, the function will be skipped.
---
- `GetPointer`
```ts
/**
 * @param {String | Number} Reference - A reference to search faster
 * @description Get Pointer
 * @return BSON.Document | Undefined
 */

OpenDB.GetPointer<string>("PointerReference");
```
#### Errors:
- (ODB-01) **The path you specified was not found.** This error is due to the specified path not being found or misplaced.
- (ODB-03) **This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.** This error is because the database is not created.
- (ODB-02) **The database root folder not exists.** This error is due to the root folder (OpenDB/) not being found.
---
- `Encrypt`
```ts
/**
 * @param {String | Number} Content - Content encrypt data
 * @param {number} Salt - (Optional) salt number
 * @description Encrypt string data
 * @output {key_encrypted: string, secret_key: string}
 */
const encryptData = OpenDB.Encrypt<string | number>("Content"); // Salt: number (optional)
```
---
- `Decrypt`
```ts
/** 
 * @param {DecryptOptions} options - Options decrypt data
 * @description Decrypt string
 * @output <Crypto-JS>.lib.CipherParams
*/
const decryptedData = OpenDB.decrypt({ EncryptKey: encryptData.key_encrypted.toString(), SecretKey: encryptData.secret_key});
```

## Development notes
- The database is in the testing phase, report any errors.
- :star: Thanks you for reading!

**[Support Discord](https://discord.gg/ZdMqhEWhUN)**
