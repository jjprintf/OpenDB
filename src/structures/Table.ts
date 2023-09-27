import { Container, TypeResolvable } from "../types";
import path from 'path';
import fs from 'fs';
import BSON from 'bson';
import { Emitter } from "./NodeEmitter";

export default class Table {
    public readonly ID: string | number;
    public Content: TypeResolvable;
    private Path: string;
    private Database: string;
    private Container: Container

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
        if (!fs.existsSync(this.Path))
			throw new Error("(ODB-01) The path you specified was not found.");

		if (!fs.existsSync(path.join(this.Path, 'OpenDB')))
			throw new Error("(ODB-02) The database root folder not exists.");
		
		if (this.Database === "none") 
			throw new Error("(ODB-10) The database is not configured.");

		if (!fs.existsSync(path.join(this.Path, 'OpenDB', this.Database)))
			throw new Error("(ODB-03) This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.");

        this.Container.Tables.forEach((x) => {
            if (x.ID === this.ID) {
                x.Content = this.Content;
            }
        });

        console.log(this.Container);

        await fs.promises.writeFile(path.join(this.Path, 'OpenDB', this.Database, 'Containers', this.Container.ID+'.bson'), BSON.serialize(this.Container))
				.catch((error) =>
				{
					if (error) Emitter.emit("error", error);
				});
    }
}