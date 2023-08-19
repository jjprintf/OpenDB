/* eslint-disable multiline-ternary */
/* eslint-disable no-delete-var */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable key-spacing */
import fs from 'node:fs';

import BSON from 'bson';

import { uid } from 'uid';

import { BaseClient } from './BaseClient';

import colors from 'colors';

colors.enable();

type ClientOptions = {
    Path?: string,
}

/**
 * @typedef {(string|number)} Reference
 */
type Reference = string | number;

type Pointer = {
    ID: string,
    Reference: Reference,
    Containers: string[]
}

type Container = {
    ID: string,
    Content: object[]
}

export interface Client
{
    Options: ClientOptions;

    Database: string;

    Pointers: Map<string, Pointer>;

    Containers: Map<string, Container>;
}

export class Client extends BaseClient
{
    /**
     * @typedef {Object} ClientOptions
     * @property {string=} Path
     */

    /**
     * @constructor
     * @param {ClientOptions} Options - Put database name and path
     */
    constructor(Options: ClientOptions)
    {
        super();

        this.Options = Options;

        if (typeof this.Options.Path === "undefined")
        {
            this.Options.Path = "../../../../";
        }

        this.Database = "none";

        this.Pointers = new Map();
        this.Containers = new Map();

        const time = new Date();

        console.log(colors.gray("Set class vars ") + (time.getMilliseconds() > 500 ? colors.yellow(`${time.getMilliseconds()}ms`) : colors.green(`${time.getMilliseconds()}ms`)));
    }

    /**
     * @public
     * @description Create root folder
     * @returns {Promise<this>}
     */
    public async Start(): Promise<this>
    {
        if (typeof this.Options.Path === "undefined")
            throw new Error("An error occurred and the path was not specified.");

        if (!fs.existsSync(__dirname + `/${this.Options.Path}`))
            throw new Error("The path you specified was not found.");

        if (fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB`))
        {
            console.log("(Warn-01) The root folder already exists, nothing will be created and this function will be skipped.");

            return this;
        }

        await fs.promises.mkdir(__dirname + `/${this.Options.Path}/OpenDB`, { recursive: true })
            .catch((Error) =>
            {
                if (Error) this.emit("error", Error);
            });

        const time = new Date();

        console.log(colors.gray("Create root folder ") + (time.getMilliseconds() >= 600 ? colors.yellow(`${time.getMilliseconds()}ms`) : colors.green(`${time.getMilliseconds()}ms`)));

        return this;
    }

    /**
     * @public
     * @param {string} Name - Database name
     * @description Create database folder
     * @returns {Promise<this>}
     */
    public async CreateDatabase(Name: string): Promise<this>
    {
        if (!fs.existsSync(__dirname + `/${this.Options.Path}`))
            throw new Error("The path you specified was not found.");

        if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB`))
            throw new Error("The database root folder not exists.");

        if (fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB/${Name}`))
        {
            console.log("(Warn-02) The database already exists.");

            return this;
        }

        const time = new Date();

        await fs.promises.mkdir(__dirname + `${this.Options.Path}/OpenDB/${Name}`, { recursive: true })
            .catch((Error) =>
            {
                if (Error) this.emit("error", Error);
            });
        console.log(colors.gray("Create directory OpenDB ") + (time.getMilliseconds() >= 400 ? colors.yellow(`${time.getMilliseconds()}ms`) : colors.green(`${time.getMilliseconds()}ms`)));

        await fs.promises.mkdir(__dirname + `/${this.Options.Path}/OpenDB/${Name}/Pointers`, { recursive: true })
            .catch((Error) =>
            {
                if (Error) this.emit("error", Error);
            });

        console.log(colors.gray("Create directory Pointers ") + (time.getMilliseconds() >= 400 ? colors.yellow(`${time.getMilliseconds()}ms`) : colors.green(`${time.getMilliseconds()}ms`)));

        await fs.promises.mkdir(__dirname + `/${this.Options.Path}/OpenDB/${Name}/Containers`, { recursive: true })
            .catch((Error) =>
            {
                if (Error) this.emit("error", Error);
            });

        console.log(colors.gray("Create directory Containers ") + (time.getMilliseconds() >= 400 ? colors.yellow(`${time.getMilliseconds()}ms`) : colors.green(`${time.getMilliseconds()}ms`)));

        return this;
    }

    /**
     * @public
     * @param {string} Name - Database name
     * @param {boolean} [Force=false] - Change force
     * @param {boolean} [NotLoad=false] - Do not preload pointers and containers
     * @description Set database
     * @returns {this}
     */
    public SetDatabase(Name: string, Force?: boolean | false, NotLoad?: boolean | false): this
    {
        if (typeof this.Options.Path === "string")
        {
            if (!fs.existsSync(__dirname + `/${this.Options.Path}`))
                throw new Error("The path you specified was not found.");

            if (fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB`))
            {
                if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB/${Name}`))
                    throw new Error("This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.");
            }
            else
            {
                throw new Error("The database root folder not exists.");
            }
        }

        if (this.Database === "none")
            this.Database = Name;
        else
        {
            if (!Force)
                throw new Error("If force is not activated, the name of the database cannot be changed.");
            else
                this.Database = Name;
        }

        if (!NotLoad)
        {
            for (const file in fs.readdirSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Pointers`))
            {
                const pointerFile = fs.readFileSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Pointers/${file}.bson`);
                const pointer = BSON.deserialize(pointerFile);

                const pointerDoc: Pointer = {
                    ID: pointer.ID,
                    Reference: pointer.Reference,
                    Containers: pointer.Containers
                };

                this.Pointers.set(pointer.ID, pointerDoc);
            }

            for (const file in fs.readdirSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers`))
            {
                const containerFile = fs.readFileSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers/${file}.bson`);
                const container = BSON.deserialize(containerFile);

                const containerDoc: Container = {
                    ID: container.ID,
                    Content: container.Content
                };

                this.Containers.set(container.ID, containerDoc);
            }
        } else
        {
            console.log("(Warn-03) This can cause loading times to increase significantly.");
        }

        const time = new Date();

        console.log(colors.gray("Set database ") + (time.getMilliseconds() >= 200 ? colors.yellow(`${time.getMilliseconds()}ms`) : colors.green(`${time.getMilliseconds()}ms`)));

        return this;
    }

    /**
     * @typedef {(string|number)} Reference
     */

    /**
     * @public
     * @param {Reference} Reference - Reference to find the pointer easier
     * @description Create pointer
     * @returns {Promise<void>}
     */
    public async CreatePointer<T extends Reference>(Reference: T): Promise<void>
    {
        if (!fs.existsSync(__dirname + `/${this.Options.Path}`))
            throw new Error("The path you specified was not found.");

        if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB`))
            throw new Error("The database root folder not exists.");

        if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}`))
            throw new Error("This database does not exist");

        if (this.GetPointer<Reference>(Reference) !== undefined)
        {
            console.warn("A pointer with this reference already exists, the pointer will not be created.");
        }

        const IDPointer = uid(16);
        const IDContainer = uid(18);

        const container = {
            ID:      IDContainer,
            Content: []
        };

        const pointer = {
            ID:         IDPointer,
            Reference:  Reference,
            Containers: [ IDContainer ]
        };

        await fs.promises.writeFile(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Pointers/${IDPointer}.bson`, BSON.serialize(pointer))
            .catch((error) =>
            {
                if (error) this.emit("error", error);
            });

        await fs.promises.writeFile(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers/${IDContainer}.bson`, BSON.serialize(container))
            .catch((error) =>
            {
                if (error) this.emit("error", error);
            });

        this.Pointers.set(IDPointer, pointer);
        this.Containers.set(IDContainer, container);

        const time = new Date();

        console.log(colors.gray("Create Pointer ") + (time.getMilliseconds() >= 600 ? colors.yellow(`${time.getMilliseconds()}ms`) : colors.green(`${time.getMilliseconds()}ms`)));

        console.log(colors.gray("pointer: ") + colors.yellow(`${IDPointer}`) + colors.gray(" => ") + colors.gray("containers: ") + colors.yellow(`${IDContainer}`));
    }

    /**
     * @public
     * @param {Reference} Reference - Reference to find the pointer easier
     * @description Get pointer
     * @returns {BSON.Document}
     */
    public GetPointer<T extends Reference>(Reference: T): BSON.Document | undefined
    {
        if (!fs.existsSync(__dirname + `/${this.Options.Path}`))
            throw new Error("The path you specified was not found.");

        if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB`))
            throw new Error("Cannot find 'OpenDB/' folder (root folder of the database).");

        if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}`))
            throw new Error("This database does not exist");

        let id = "none";
        let Pointer = undefined;

        this.Pointers.forEach((x) =>
        {
            if (x.Reference === Reference)
            {
                id = x.ID;
            }
        });

        if (id === "none")
        {
            for (const file in fs.readdirSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Pointers`))
            {
                const pointerFile = fs.readFileSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Pointers/${file}.bson`);
                const pointer = BSON.deserialize(pointerFile);

                if (Reference === pointer.Reference)
                {
                    Pointer = pointer;

                    return pointer;
                }
            }

            if (Pointer === undefined)
                return Pointer;

            return Pointer;
        }

        const time = new Date();

        console.log("Get pointer");
        console.log(time.getMilliseconds() + "ms" + "\n" + time.getSeconds() + "s");

        return this.Pointers.get(id);
    }

    public AddContainer<T extends Reference>(Reference: T, Container?: string | null)
    {
        if (!fs.existsSync(__dirname + `/${this.Options.Path}`))
            throw new Error("The path you specified was not found.");

        if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB`))
            throw new Error("Cannot find 'OpenDB/' folder (root folder of the database).");

        if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}`))
            throw new Error("This database does not exist");

        const Pointer = this.GetPointer<Reference>(Reference);
        const containers = [];

        if (typeof Pointer === "undefined" || !Pointer)
            throw new Error("Pointer not found");

        if (typeof Container === "string")
        {
            if (Container.length !== 18)
                throw new Error("This ID is not correct");

            if (!this.Containers.get(Container))
                throw new Error("This ID is not correct");

            containers.push(Container);
        }
        else
        {
            const ID = uid(18);
            containers.push(ID);

            const container = {
                ID:      ID,
                Content: []
            };

            fs.writeFile(__dirname + `/${this.Options.Path}/OpenDB/Containers/${ID}.bson`, BSON.serialize(container), (error) =>
            {
                if (error) this.emit("error", error);
            });
        }

        const pointer = {
            ID: Pointer.ID,
            Reference: Reference,
            Containers: containers
        };

        this.Pointers.set(Pointer.ID, {
            ID:         Pointer.ID,
            Reference:  Reference,
            Containers: containers
        });

        fs.writeFile(__dirname + `/${this.Options.Path}/OpenDB/Containers/${Pointer.ID}.bson`, BSON.serialize(pointer), (error) =>
        {
            if (error) this.emit("error", error);
        });

        const time = new Date();

        console.log("AddContainer to pointer");
        console.log(time.getMilliseconds() + "ms" + "\n" + time.getSeconds() + "s");
    }
}
