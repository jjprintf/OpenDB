import { Container, TypeResolvable } from "../types";
export default class Table {
    ID: string | number;
    Content: TypeResolvable;
    protected Path: string;
    protected Database: string;
    protected Container: Container;
    /**
     * @constructor
     * @param {(string | number)} ID - Table ID
     * @param {TypeResolvable} Content - Table Content
     * @param {string} Path - Database path
     * @param {string} Database - Database name
     * @param {Container} Container - Container
     */
    constructor(ID: string | number, Content: TypeResolvable, Path: string, Database: string, Container: Container);
    /**
     * @public
     * @async
     * @description save table
     * @returns void
     */
    save(): Promise<void>;
}
