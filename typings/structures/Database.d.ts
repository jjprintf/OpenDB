import { Document } from 'bson';
import { BaseClient } from './BaseClient';
import crypto from 'crypto-js';
declare type options = {
    database: string;
    path: string;
};
export interface Database {
    database: string;
    path: string;
    options: options;
}
declare type dataPush = {
    content: object;
    id?: string | number;
};
declare type findOptions = {
    id?: string | number;
    keyName?: string;
    keyValue: string;
};
declare type editKey = {
    key: string;
    value: string;
};
declare type editOptions = {
    find: findOptions;
    edit: editKey;
};
declare type encriptOptions = {
    content: string;
    salt?: number | 10;
};
declare type decryptOptions = {
    encryptKey: crypto.lib.CipherParams;
    secretKey: string;
};
export declare class Database extends BaseClient {
    /**
   * @typedef {Object} DatabaseOptions
   * @property {string} database - Database name
   * @property {string} path - Path to create ajax_databases folder
   */
    /**
     * @constructor
     * @param {DatabaseOptions} options - Put database name and path
     */
    constructor(options: options);
    /**
     * @protected
     * @description Check if the "ajax_databases" directory exists
     * @returns boolean
     */
    protected CheckDatabaseDir(): boolean;
    /**
     * @protected
     * @description Check if the "pointers" directory exists
     * @returns boolean
     */
    protected CheckPointersDir(): boolean;
    /**
     * @protected
     * @description Check if the "containers" directory exists
     * @returns boolean
     */
    protected CheckContainersDir(): boolean;
    /**
     * @protected
     * @description Check if the pointer file exists
     * @param {string} pointer - Pointer name
     * @returns boolean
     */
    protected CheckPointer(pointer: string): boolean;
    /**
     * @protected
     * @description Check if the container file exists
     * @param {string} pointer - Pointer name
     * @returns boolean
     */
    protected CheckContainer(pointer: string): boolean;
    /**
     * @protected
     * @async
     * @description Create pointers folder
     * @returns void
     */
    protected CreatePointers(): Promise<void>;
    /**
     * @protected
     * @async
     * @description Create containers folder
     * @returns void
     */
    protected CreateContainers(): Promise<void>;
    /**
     * @protected
     * @description Write container file
     * @param {string} container - container name
     * @param {Object} value - Container new data
     */
    protected writeContainer(container: string, value: object): void;
    /**
     * @protected
     * @description write container pointer
     * @param {string} pointer - Pointer name
     * @param {Object} value  - Pointer new data
     */
    protected writePointer(pointer: string, value: object): void;
    /**
     * @protected
     * @async
     * @description Find pointer information
     * @param {string} key - Key to find pointer information
     * @returns object
     */
    protected findPointer(key: string): Promise<Document>;
    /**
     * @protected
     * @async
     * @description Find container information
     * @param {string} keyOfPointer - Pointer name
     * @returns object
     */
    protected findContainer(keyOfPointer: string): Promise<Document | undefined>;
    /**
   * @typedef {Object} PushOptions
   * @property {Object} content - Content data to push
   * @property {?(string|number)}  id? - ID container (Optional)
   */
    /**
     * @public
     * @async
     * @description Push the data to the container
     * @param {string} key - Pointer name
     * @param {PushOptions} data - Data to be pushed
     * @param AUTO_INCREMENT
     */
    push(key: string, data: dataPush, AUTO_INCREMENT?: boolean): Promise<void>;
    /**
     * @protected
     * @async
     * @description Count the containers
     * @param {string} pointer - Pointer name
     * @returns number
     */
    protected sizeContainers(pointer: string): Promise<number>;
    /**
     * @public
     * @async
     * @deprecated
     * @description Delete multiple keys together
     */
    deleteSeveralByKey(pointers: string[], keys: string[]): Promise<void>;
    /**
     * @public
     * @async
     * @description Delete keys
     * @param {string} pointer - Pointer name
     * @param {string} key - Key name
     */
    deleteByKey(pointer: string, key: string): Promise<void>;
    /**
   * @typedef {Object} FindOptions
   * @property {string} keyName - Key to find
   * @property {string} keyValue - Value to find
   */
    /**
     * @public
     * @async
     * @description Get container data
     * @param {string} pointer - Pointer name
     * @param {FindOptions} find - Data to be find for in the container
     * @returns object
     */
    get(pointer: string, find: findOptions): Promise<object | null>;
    /**
   * @typedef {Object} EditKeyOptions
   * @property {string} key - Key to edit
   * @property {string} value - Value to edit
   */
    /**
   * @typedef {Object} EditOptions
   * @property {FindOptions}  find - Find options
   * @property {EditKeyOptions} edit - Edit key options
   */
    /**
     * @public
     * @async
     * @description Edit data container
     * @param {string} pointer - Pointer name
     * @param {EditOptions} editOptions - Edit options
     */
    edit(pointer: string, editOptions: editOptions): Promise<void>;
    /**
     * @public
     * @description Count the pointers
     * @returns number
     */
    size(): number;
    /**
     * @protected
     * @description Count the containers in containers folder
     * @param {string} pointer - Pointer name
     * @returns number
     */
    protected sizeContainer(pointer: string): number | undefined;
    /**
   * @typedef {Object} EncryptedOptions
   * @property {string} content - Content to be encrypted
   * @property {?number} [salt=10] - Length salt
   */
    /**
     * @public
     * @description Encrypted string
     * @param {EncryptedOptions} options - Encrypted Options
     * @returns object
     */
    encrypt(options: encriptOptions): {
        key_encrypt: crypto.lib.CipherParams;
        secret_key: string;
    };
    /**
   * @typedef {Object} DecryptedOptions
   * @property {CipherParams} encryptKey - Encrypted key string generate by encrypt method
   * @property {string} secretKey - Secret key generate by encrypt method
   */
    /**
     * @public
     * @description Decrypted string
     * @param {DecryptedOptions} options - Descrypted options
     * @returns string
     */
    decrypt(options: decryptOptions): string;
}
export {};
