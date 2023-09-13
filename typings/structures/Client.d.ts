import BSON from 'bson';
import { BaseClient } from './BaseClient';
type ClientOptions = {
    Path?: string;
};
type Pointer = {
    ID: string;
    Reference: string | number;
    Containers: string[];
};
type AnyArray = object[] | string[] | number[];
type Push = string | object | AnyArray | number;
type Container = {
    ID: string;
    Tables: ContainerTable[];
};
type ContainerTable = {
    ID: number;
    Content: Push;
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
     * @typedef {(object[] | string[] | number[])} AnyArray
     */
    /**
     * @typedef {(string | object | AnyArray | number)} Push
     */
    /**
     * @constructor
     * @param {ClientOptions} Options - Put database name and path
     */
    constructor(Options: ClientOptions);
    private CheckFolders;
    /**
     * @public
     * @async
     * @description Create root folder
     * @returns {Promise<this>}
     */
    Start(): Promise<this>;
    /**
     * @public
     * @async
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
     * @public
     * @async
     * @param {(string|number)} Reference - Reference to find the pointer easier
     * @description Create pointer
     * @returns {Promise<void>}
     */
    CreatePointer(Reference: string | number): Promise<void>;
    /**
     * @public
     * @param {(string|number)} Reference - Reference to find the pointer easier
     * @description Get pointer
     * @returns {BSON.Document}
     */
    GetPointer(Reference: string | number): BSON.Document | undefined;
    /**
     * @public
     * @param {string} Container - Container ID
     * @description Get Container
     * @returns {BSON.Document}
     */
    GetContainer(Container: string): BSON.Document | undefined;
    /**
     * @public
     * @async
     * @param {Push} Content - Push content
     * @param {(string|number)} Reference - Reference to find the pointer easier
     * @param {(number|string)} id - Table ID
     * @param {string} [Container=false] - Container ID
     * @description Push data to container
     * @returns {Promise<void>}
     */
    Push<T extends Push>(Content: T, Reference: string | number, id?: number | string, Container?: string): Promise<void>;
    /**
     * @public
     * @param {(string|number)} Reference - Reference to find the pointer easier
     * @param {string} [Container=false] - Container ID
     * @description Add an existing container or not, to a pointer
     * @returns {void}
     */
    AddContainer(Reference: string | number, Container?: string | null): Promise<void>;
    /**
     * @public
     * @async
     * @param {(string|number)} Reference - Reference to find the pointer easier
     * @param {(number|string|null)} KeyName - Key name to search the container
     * @param {Push} KeyValue - Key value to search the container
     * @param {Push} Value - Value to define
     * @param {number} [TableId=false] - Table ID
     * @param {string} [Container=false] - Container ID
     * @description Edit a key in the container
     * @returns {Promise<void>}
     */
    Edit<T extends Push>(Reference: string | number, KeyName: number | string | null, KeyValue: T, Value: T, TableId?: number, Container?: string): Promise<void>;
    /**
     * @public
     * @async
     * @param {(string|number)} Reference - Reference to find the pointer easier
     * @param {(string | number | null)} KeyName - Key name to search the container
     * @param {Push} KeyValue - Key value to search the container
     * @param {string} [Container=false] - Container ID
     * @description Search table by a key
     * @returns {Promise<ContainerTable | undefined>}
     */
    Find<T extends Push>(Reference: string | number, KeyName: string | number | null, KeyValue: T, Container?: string): ContainerTable | undefined;
    /**
     * @public
     * @async
     * @param {(string|number)} Reference - Reference to find the pointer easier
     * * @param {number} TableId - TableId ID
     * @param {string} [Container=false] - Container ID
     * @description Get table by a table id
     * @returns {Promise<ContainerTable | undefined>}
     */
    Get(Reference: string | number, TableId: number, Container?: string): ContainerTable | undefined;
    /**
     * @public
     * @async
     * @param {(string|number)} Reference - Reference to find the pointer easier
     * @param {number} TableId - Table ID
     * @param {string} [Container=false] - Container ID
     * @description Delete Table
     * @returns {Promise<void>}
     */
    DeleteTable(Reference: string | number, TableId: number, Container?: string): Promise<void>;
    /**
     * @public
     * @async
     * @param {(string|number)} Reference - Reference to find the pointer easier
     * @param {(string | number | null)} KeyName - Key name to search the container
     * @param {Push} KeyValue - Key value to search the container
     * @param {string} [Container=false] - Container ID
     * @description Delete Table by Key
     * @returns {Promise<void>}
     */
    DeleteTableByKey<T extends Push>(Reference: string | number, KeyName: string | number | null, KeyValue: T, Container?: string): Promise<void>;
    /**
     * @public
     * @async
     * @param {(string|number)} Reference - Reference to find the pointer easier
     * @param {(number|string|null)} KeyName - Key name to search the container
     * @param {Push} KeyValue - Key value to search the container
     * @param {string} [Container=false] - Container ID
     * @description Delete Key
     * @returns {Promise<void>}
     */
    DeleteKey<T extends Push>(Reference: string | number, KeyName: string | number | null, KeyValue: T, Container?: string): Promise<void>;
}
export {};
