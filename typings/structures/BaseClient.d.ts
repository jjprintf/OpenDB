/// <reference types="node" />
import { EJSON } from 'bson';
import { lib } from 'crypto-js';
import { DecryptOptions, EncryptsTypes } from '../types/Encrypt';
import { EventEmitter } from 'node:events';
/**
 * @type {ejson} EJSON
 */
type ejson = typeof EJSON;
type ErrorClient = string | number | object | undefined;
export interface BaseClient {
    ejson: ejson;
    on(event: 'error', listener: (error: ErrorClient) => void): this;
    on(event: 'start', listener: () => void): this;
}
export declare class BaseClient extends EventEmitter {
    /**
     * @constructor
     */
    constructor();
    /**
     * @typedef {(string|number)} EncryptsTypes
     */
    /**
     * @typedef {object} Encrypt
     * @property {lib.CipherParams} key_encrypt
     * @property {string} secret_key
     */
    /**
     * @public
     * @description Encrypted string
     * @param {EncyptsTypes} Content - Content to be encrypted
     * @param {number} Salt - Number of salts
     * @returns {Encrypt}
     */
    Encrypt<T extends EncryptsTypes>(Content: T, Salt: number | 10): {
        key_encrypt: lib.CipherParams;
        secret_key: string;
    };
    /**
     * @typedef {Object} DecryptedOptions
     * @property {CipherParams} EncryptKey - Encrypted key string generate by encrypt method
     * @property {string} SecretKey - Secret key generate by encrypt method
     */
    /**
     * @public
     * @description Decrypted string
     * @param {DecryptOptions} Options - Content to be decrypted
     * @returns {object}
     */
    Decrypt(Options: DecryptOptions): string;
}
export {};
