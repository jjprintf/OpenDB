import { EJSON } from 'bson';
import { genSaltSync, hashSync } from 'bcryptjs';
import { AES, enc, lib } from 'crypto-js';
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
export class BaseClient extends EventEmitter 
{
    /**
     * @constructor
     */
    constructor() {
        super();
        this.ejson = EJSON;
    }

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
    public Encrypt<T extends EncryptsTypes>(Content: T, Salt: number | 10)
    {
        const salt = genSaltSync(Salt);

        if (typeof Content == "string")
        {
            const Hash = hashSync(Content, salt);
            const EncryptKey = AES.encrypt(Content, Hash);

            return { key_encrypt: EncryptKey, secret_key: Hash };
        }
        else
        {
            const Hash = hashSync(Content.toString(), salt);
            const EncryptKey = AES.encrypt(Content.toString(), Hash);

            return { key_encrypt: EncryptKey, secret_key: Hash };
        }
    }

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
    public Decrypt(Options: DecryptOptions)
    {
        return AES.decrypt(Options.EncryptKey, Options.SecretKey).toString(enc.Utf8);
    }
}
