# @OpenDB

# **IMPORTANT! The package is a pre-release, it's not finished, it shouldn't be used yet.**

> Documentation: [OpenDB Docs](https://printfdead.github.io/ajaxdb/index.html)
# Information:
- :wrench: Efficient and fast database using BSON.
- :butterfly: Simple and easy to use
- :smile: Version 2.4

# Installation
```sh
npm i open.db --save
```

# Important Notes:
> BSON Error: **bson size must be >= 5, is 0** This is solved by deleting the OpenDB folder and restarting the app, it is because the containers and pointers were not saved correctly.

> Errors: The errors and/or warnings shown in this documentation are errors/warns that can occur when running OpenDB, they are only informative, a solution can be reached by reading the description of each error/warn.

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

await OpenDB.CreatePointer("PointerReference");
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

OpenDB.GetPointer("PointerReference");
```
#### Errors:
- (ODB-01) **The path you specified was not found.** This error is due to the specified path not being found or misplaced.
- (ODB-03) **This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.** This error is because the database is not created.
- (ODB-02) **The database root folder not exists.** This error is due to the root folder (OpenDB/) not being found.
---
- `GetContainer`
```ts
/**
 * @param {string} Container - Container ID
 * @description Get Container
 * @returns BSON.Document | Undefined
 */

OpenDB.GetContainer("ContainerID");
```
#### Errors:
- (ODB-01) **The path you specified was not found.** This error is due to the specified path not being found or misplaced.
- (ODB-03) **This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.** This error is because the database is not created.
- (ODB-02) **The database root folder not exists.** This error is due to the root folder (OpenDB/) not being found.
---
- `Push`
```ts
/**
 * @param {String | Number | Object | Array} Content - Content push
 * @param {String | Number} Reference - A reference to search faster
 * @param {String | Number} id (optional) - Table ID
 * @param {String} Container (optional) - Container ID
 * @generic {String | Number | Object | Array} T 
 * @description Get Pointer
 * @return Promise<this>
 */

await OpenDB.Push<string>("This content can be object, string, number and array", "Pointer Reference", 1, "Container ID");
```
#### Errors:
- (ODB-01) **The path you specified was not found.** This error is due to the specified path not being found or misplaced.
- (ODB-03) **This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.** This error is because the database is not created.
- (ODB-02) **The database root folder not exists.** This error is due to the root folder (OpenDB/) not being found. 
- (ODB-05) **Pointer not found.** This error is because the pointer not found.
- (ODB-07) **The id is already in use.** This happens when the table id is already in use.
---
- `AddContainer`
```ts
/**
 * @param {Reference} Reference - Reference to find the pointer easier
 * @param {string} Container (optional) - Container ID
 * @description Add an existing container or not, to a pointer
 * @returns void
 */

OpenDB.AddContainer("Pointer reference", "Container ID");
```
#### Errors:
- (ODB-01) **The path you specified was not found.** This error is due to the specified path not being found or misplaced.
- (ODB-03) **This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.** This error is because the database is not created.
- (ODB-02) **The database root folder not exists.** This error is due to the root folder (OpenDB/) not being found. 
- (ODB-05) **Pointer not found.** This error is because the pointer not found.
- (ODB-10) **This ID is not correct.** This error is because the container id is not correct.
---
- `Edit`
```ts
/**
 * @param {Reference} Reference - Reference to find the pointer easier
 * @param {number | string | null} KeyName - Key name to search the container
 * @param {Push} KeyValue - Key value to search the container
 * @param {Push} Value - Value to define
 * @param {number} TableId (optional) - Table ID
 * @param {string} Container (optional) - Container ID
 * @description Edit a key in the container
 * @returns Promise<void>
 */

await OpenDB.Edit<string>("Pointer Reference", null, "Test1", "Test2", 1, "Container ID");
```
### Note:
- **KeyName:** If your KeyName is not an object just put null.
#### Errors:
- (ODB-01) **The path you specified was not found.** This error is due to the specified path not being found or misplaced.
- (ODB-03) **This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.** This error is because the database is not created.
- (ODB-02) **The database root folder not exists.** This error is due to the root folder (OpenDB/) not being found. 
- (ODB-05) **Pointer not found.** This error is because the pointer not found.
- (ODB-08) **Key not found.** This happens when the key was not found.
- (ODB-10) **This ID is not correct.** This error is because the container id is not correct.
---
- `DeleteTable`
```ts
/**
	* @param {Reference} Reference - Reference to find the pointer easier
	* @param {number} TableId - Table ID
	* @param {string} Container (optional) - Container ID
	* @description Delete Table
	* @returns Promise<void>
  */

await OpenDB.DeleteTable("Pointer Reference", 1, "Container ID");
```
#### Errors:
- (ODB-01) **The path you specified was not found.** This error is due to the specified path not being found or misplaced.
- (ODB-03) **This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.** This error is because the database is not created.
- (ODB-02) **The database root folder not exists.** This error is due to the root folder (OpenDB/) not being found. 
- (ODB-05) **Pointer not found.** This error is because the pointer not found.
- (ODB-06) **Container not found.** This error is because the container not found.
- (ODB-08) **Key not found.** This happens when the key was not found.
---
- `DeleteTableByKey`
```ts
/** 
 * @param {Reference} Reference - Reference to find the pointer easier
 * @param {string | number | null} KeyName - Key name to search the container
 * @param {Push} KeyValue - Key value to search the container
 * @param {string} Container (optional) - Container ID
 * @description Delete Table by Key
 * @returns Promise<void>
 */

await OpenDB.DeleteTableByKey<string>("Pointer Reference", null, "Test1", "Container ID");
```
### Note:
- **KeyName:** If your KeyName is not an object just put null.
#### Errors:
- (ODB-01) **The path you specified was not found.** This error is due to the specified path not being found or misplaced.
- (ODB-03) **This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.** This error is because the database is not created.
- (ODB-02) **The database root folder not exists.** This error is due to the root folder (OpenDB/) not being found. 
- (ODB-05) **Pointer not found.** This error is because the pointer not found.
- (ODB-06) **Container not found.** This error is because the container not found.
- (ODB-08) **Key not found.** This happens when the key was not found.
- (ODB-10) **This ID is not correct.** This error is because the container id is not correct.
---
- `DeleteKey`
```ts
/**
 * @param {Reference} Reference - Reference to find the pointer easier
 * @param {number | string | null} KeyName - Key name to search the container
 * @param {Push} KeyValue - Key value to search the container
 * @param {string} Container (optional) - Container ID
 * @description Delete Key
 * @returns Promise<void>
 */

await OpenDB.DeleteKey<string>("Pointer Reference", null, "Test1", "Container ID");
```
### Note:
- **KeyName:** If your KeyName is not an object just put null.
#### Errors:
- (ODB-01) **The path you specified was not found.** This error is due to the specified path not being found or misplaced.
- (ODB-03) **This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.** This error is because the database is not created.
- (ODB-02) **The database root folder not exists.** This error is due to the root folder (OpenDB/) not being found. 
- (ODB-05) **Pointer not found.** This error is because the pointer not found.
- (ODB-06) **Container not found.** This error is because the container not found.
- (ODB-08) **Key not found.** This happens when the key was not found.
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
