import { Container, TypeResolvable } from "../types";
import path from 'path';
import fs from 'fs';
import BSON from 'bson';
import { Emitter } from "./NodeEmitter";

export default class Table {
    public ID: string | number;
    public Content: TypeResolvable;
    protected Path: string;
    protected Database: string;
    protected Container: Container

    /**
     * @constructor
     * @param {(string | number)} ID - Table ID 
     * @param {TypeResolvable} Content - Table Content
     * @param {string} Path - Database path
     * @param {string} Database - Database name 
     * @param {Container} Container - Container
     */
    constructor(ID: string | number, Content: TypeResolvable, Path: string, Database: string, Container: Container) {
        this.ID = ID;
        this.Content = Content;
        this.Path = Path;
        this.Database = Database;
        this.Container = Container;
    }

    /**
     * @public
     * @async
     * @description save table
     * @returns void
     */
    public async save(): Promise<void> {
        this.Container.Tables.forEach((x) => {
            if (x.ID === this.ID) {
                x.Content = this.Content;
            }
        });

        await fs.promises.writeFile(path.join(this.Path, 'OpenDB', this.Database, 'Containers', this.Container.ID+'.bson'), BSON.serialize(this.Container))
				.catch((error) =>
				{
					if (error) Emitter.emit("error", error);
				});
    }
}