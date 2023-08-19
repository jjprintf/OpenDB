import BSON from 'bson';
import { BaseClient } from './BaseClient';
type ClientOptions = {
    Path?: string;
};
/**
 * @typedef {(string|number)} Reference
 */
type Reference = string | number;
type Pointer = {
    ID: string;
    Reference: Reference;
    Containers: string[];
};
type Container = {
    ID: string;
    Content: object[];
};
export interface Client {
    Options: ClientOptions;
    Database: string;
    Pointers: Map<string, Pointer>;
    Containers: Map<string, Container>;
}
export declare class Client extends BaseClient {
    /**
     * @typedef {Object} ClientOptions
     * @property {string=} Path
     */
    /**
     * @constructor
     * @param {ClientOptions} Options - Put database name and path
     */
    constructor(Options: ClientOptions);
    /**
     * @public
     * @description Create root folder
     * @returns {Promise<this>}
     */
    Start(): Promise<this>;
    /**
     * @public
     * @param {string} Name - Database name
     * @description Create database folder
     * @returns {Promise<this>}
     */
    CreateDatabase(Name: string): Promise<this>;
    /**
     * @public
     * @param {string} Name - Database name
     * @param {boolean} [Force=false] - Change force
     * @param {boolean} [NotLoad=false] - Do not preload pointers and containers
     * @description Set database
     * @returns {this}
     */
    SetDatabase(Name: string, Force?: boolean | false, NotLoad?: boolean | false): this;
    /**
     * @typedef {(string|number)} Reference
     */
    /**
     * @public
     * @param {Reference} Reference - Reference to find the pointer easier
     * @description Create pointer
     * @returns {Promise<void>}
     */
    CreatePointer<T extends Reference>(Reference: T): Promise<void>;
    /**
     * @public
     * @param {Reference} Reference - Reference to find the pointer easier
     * @description Get pointer
     * @returns {BSON.Document}
     */
    GetPointer<T extends Reference>(Reference: T): BSON.Document | undefined;
    AddContainer<T extends Reference>(Reference: T, Container?: string | null): void;
}
export {};
