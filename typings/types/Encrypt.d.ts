import { lib } from 'crypto-js';
export type EncryptsTypes = string | number;
export type DecryptOptions = {
    EncryptKey: lib.CipherParams;
    SecretKey: string;
};
