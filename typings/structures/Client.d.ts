import { BSON } from 'bson';
import { ClientOptions, Pointer, TypeResolvable, Container, ContainerTable, PredicateType } from '../types';
import Table from './Table';
export interface Client {
    Options: ClientOptions;
    Database: string;
    Pointers: Map<string, Pointer>;
    Containers: Map<string, Container>;
    Path: string[];
}
export declare class Client {
    /**
     * @typedef {Object} ClientOptions
     * @property {string=} Path
     */
    /**
     * @typedef {function} PredicateType<T>
     * @param {T} [value=]
     * @param {number} [index=]
     * @param {T[]} [array=]
     */
    /**
     * @typedef {(object[] | string[] | number[])} AnyArray
     */
    /**
     * @typedef {(string | object | AnyArray | number)} TypeResolvable
     */
    /**
     * @constructor
     * @param {ClientOptions} Options - Put database name and path
     */
    constructor(Options: ClientOptions);
    private CheckFolders;
    /**
     * @public
     * @param {BSON.DeserializeOptions} [deserializeOptions=] - Deserialize Options
     * @description Update cache after a change in the container, without the change having been made in the cache.
     * @returns void
     */
    Update(deserializeOptions?: BSON.DeserializeOptions): void;
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
     * @param {BSON.DeserializeOptions} [deserializeOptions=] - Deserialize Options
     * @description Set database
     * @returns {this}
     */
    SetDatabase(Name: string, deserializeOptions?: BSON.DeserializeOptions): this;
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
     * @param {BSON.DeserializeOptions} [deserializeOptions=] - Deserialize Options
     * @description Get Container
     * @returns {BSON.Document}
     */
    GetContainer(Container: string, deserializeOptions?: BSON.DeserializeOptions): BSON.Document | undefined;
    /**
     * @public
     * @async
     * @param {TypeResolvable} Content - Push content
     * @param {(string|number)} Reference - Reference to find the pointer easier
     * @param {(number|string)} id - Table ID
     * @param {string} [Container=false] - Container ID
     * @description Push data to container
     * @returns {Promise<void>}
     */
    Add<T extends TypeResolvable>(Content: T, Reference: string | number, id?: number | string, Container?: string): Promise<void>;
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
     * @param {(string|number)} Reference - Reference to find the pointer easier
     * @param {PredicateType<T>} predicate - Predicate to find data
     * @param {string} [Container=false] - Container ID
     * @returns {(Table | undefined)}
     */
    Find(Reference: string | number, predicate: PredicateType<ContainerTable>, Container?: string): Table | undefined;
    /**
     * @public
     * @param {(string|number)} Reference - Reference to find the pointer easier
     * @param {PredicateType<T>} predicate - Predicate to filter data
     * @param {string} [Container=false] - Container ID
     * @returns {(ContainerTable[] | undefined)}
     */
    Filter(Reference: string | number, predicate: PredicateType<ContainerTable>, Container?: string): ContainerTable[] | undefined;
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
     * @param {TypeResolvable} KeyValue - Key value to search the container
     * @param {string} [Container=false] - Container ID
     * @description Delete Table by Key
     * @returns {Promise<void>}
     */
    DeleteTableByKey<T extends TypeResolvable>(Reference: string | number, KeyName: string | number | null, KeyValue: T, Container?: string): Promise<void>;
    /**
     * @public
     * @async
     * @param {(string|number)} Reference - Reference to find the pointer easier
     * @param {(number|string|null)} KeyName - Key name to search the container
     * @param {TypeResolvable} KeyValue - Key value to search the container
     * @param {string} [Container=false] - Container ID
     * @description Delete Key
     * @returns {Promise<void>}
     */
    DeleteKey<T extends TypeResolvable>(Reference: string | number, KeyName: string | number | null, KeyValue: T, Container?: string): Promise<void>;
}
