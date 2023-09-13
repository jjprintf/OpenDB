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

type AnyArray = object[] | string[] | number[];

type Push = string | object | AnyArray | number;

type Container = 
{
	ID: string,
	Tables: ContainerTable[]
}

type ContainerTable = 
{
	ID: number
	Content: Push
}

type DeleteType = 
{
	KeyName: string | number,
	KeyValue: Push	
} |
{
	TableID: number | string
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
	 * @typedef {(string | number)} Reference
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
	constructor(Options: ClientOptions)
	{
		super();

		const start = Date.now();

		this.Options = Options;

		if (typeof this.Options.Path === "undefined")
		{
			this.Options.Path = "../../../";
		}
		else
		{
			if (this.Options.Path.startsWith("/"))
				this.Options.Path = this.Options.Path.slice(1);
			if (this.Options.Path.endsWith("/"))
				this.Options.Path = this.Options.Path.slice(0, this.Options.Path.length - 1);
			if (this.Options.Path.startsWith("./") && !this.Options.Path.startsWith(".."))
				this.Options.Path = this.Options.Path.slice(2);
		}

		this.Database = "none";

		this.Pointers = new Map();
		this.Containers = new Map();

		BSON.setInternalBufferSize(500);

		this.emit("start");

		const end = Date.now();

		console.log(colors.gray("Set class vars ") + ((end - start) > 1 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));
	}

	/**
	 * @public
	 * @async
	 * @description Create root folder
	 * @returns {Promise<this>}
	 */
	public async Start(): Promise<this>
	{
		const start = Date.now();

		if (typeof this.Options.Path === "undefined")
			throw new Error("An error occurred and the path was not specified.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}`))
			throw new Error("(ODB-01) The path you specified was not found.");

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

		const end = Date.now();

		console.log(colors.gray("Create root folder ") + ((end - start) > 500 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));

		return this;
	}

	/**
	 * @public
	 * @async
	 * @param {string} Name - Database name
	 * @description Create database folder
	 * @returns {Promise<this>}
	 */
	public async CreateDatabase(Name: string): Promise<this>
	{
		if (!fs.existsSync(__dirname + `/${this.Options.Path}`))
			throw new Error("(ODB-01) The path you specified was not found.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB`))
			throw new Error("(ODB-02) The database root folder not exists.");

		if (fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB/${Name}`))
		{
			console.log("(Warn-02) The database already exists.");

			return this;
		}

		let start = Date.now();

		await fs.promises.mkdir(__dirname + `/${this.Options.Path}/OpenDB/${Name}`, { recursive: true })
			.catch((Error) =>
			{
				if (Error) this.emit("error", Error);
			});

		let end = Date.now();

		console.log(colors.gray("Create directory OpenDB ") + ((end - start) > 500 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));

		start = Date.now();

		await fs.promises.mkdir(__dirname + `/${this.Options.Path}/OpenDB/${Name}/Pointers`, { recursive: true })
			.catch((Error) =>
			{
				if (Error) this.emit("error", Error);
			});

		end = Date.now();

		console.log(colors.gray("Create directory Pointers ") + ((end - start) > 500 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));

		start = Date.now();

		await fs.promises.mkdir(__dirname + `/${this.Options.Path}/OpenDB/${Name}/Containers`, { recursive: true })
			.catch((Error) =>
			{
				if (Error) this.emit("error", Error);
			});

		end = Date.now();

		console.log(colors.gray("Create directory Containers ") + ((end - start) > 5 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));

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
		const start = Date.now();

		if (typeof this.Options.Path === "string")
		{
			if (!fs.existsSync(__dirname + `/${this.Options.Path}`))
				throw new Error("(ODB-01) The path you specified was not found.");

			if (fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB`))
			{
				if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB/${Name}`))
					throw new Error("(ODB-03) This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.");
			}
			else
			{
				throw new Error("(ODB-02) The database root folder not exists.");
			}
		}

		if (this.Database === "none")
			this.Database = Name;
		else
		{
			if (!Force)
				throw new Error("(ODB-04) If force is not activated, the name of the database cannot be changed.");
			else
				this.Database = Name;
		}

		if (!NotLoad)
		{
			for (const file of fs.readdirSync(__dirname + `/${this.Options.Path}/OpenDB/${Name}/Pointers`, { recursive: true }))
			{
				const pointerFile = fs.readFileSync(__dirname + `/${this.Options.Path}/OpenDB/${Name}/Pointers/${file}`);
				const pointer = BSON.deserialize(pointerFile);

				const pointerDoc: Pointer = {
					ID: pointer.ID,
					Reference: pointer.Reference,
					Containers: pointer.Containers
				};

				this.Pointers.set(pointer.ID, pointerDoc);
			}

			for (const file of fs.readdirSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers`, { recursive: true }))
			{
				const containerFile = fs.readFileSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers/${file}`);

				let ContainerDocument: any[] = [];
				
				if (BSON.calculateObjectSize(containerFile) >= 5) 
				{
					const container = BSON.deserializeStream(containerFile, 0, 1, ContainerDocument, 0, { allowObjectSmallerThanBufferSize: true });
					
					const containerDoc: Container = {
						ID: ContainerDocument[0].ID,
						Tables: ContainerDocument[0].Tables
					};

					this.Containers.set(ContainerDocument[0].ID, containerDoc);
				} else
				{
					const container = BSON.deserialize(containerFile);
					
					const containerDoc: Container = 
					{
						ID: container.ID,
						Tables: container.Tables
					}
					this.Containers.set(container.ID, containerDoc);
				}
			}
		} else
		{
			console.log("(Warn-03) This can cause loading times to increase significantly.");
		}

		const end = Date.now();

		console.log(colors.gray("Set database ") + ((end - start) >= 5 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));

		return this;
	}

	/**
	 * @public
	 * @async
	 * @param {Reference} Reference - Reference to find the pointer easier
	 * @description Create pointer
	 * @returns {Promise<void>}
	 */
	public async CreatePointer(Reference: Reference): Promise<void>
	{
		const start = Date.now();

		if (!fs.existsSync(__dirname + `/${this.Options.Path}`))
			throw new Error("(ODB-01) The path you specified was not found.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB`))
			throw new Error("(ODB-02) The database root folder not exists.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}`))
			throw new Error("(ODB-03) This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.");

		if (this.GetPointer(Reference) !== undefined)
		{
			console.warn("(Warn-04) A pointer with this reference already exists, the pointer will not be created.");
			return;
		}

		const IDPointer = uid(16);
		const IDContainer = uid(18);

		const container = {
			ID:      IDContainer,
			Tables: []
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

		const end = Date.now();

		console.log(colors.gray("Create Pointer ") + ((end - start) > 10 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));

		console.log(colors.gray("pointer: ") + colors.yellow(`${IDPointer}`) + colors.gray(" => ") + colors.gray("containers: ") + colors.yellow(`${IDContainer}`));
	}

	/**
	 * @public
	 * @param {Reference} Reference - Reference to find the pointer easier
	 * @description Get pointer
	 * @returns {BSON.Document}
	 */
	public GetPointer(Reference: Reference): BSON.Document | undefined
	{
		const start = Date.now();

		if (!fs.existsSync(__dirname + `/${this.Options.Path}`))
			throw new Error("(ODB-01) The path you specified was not found.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB`))
			throw new Error("(ODB-02) The database root folder not exists.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}`))
			throw new Error("(ODB-03) This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.");

		let Pointer = undefined;

		this.Pointers.forEach((x) =>
		{
			if (x.Reference === Reference)
			{
				Pointer = x;
			}
		});

		if (Pointer === undefined)
		{
			for (const file of fs.readdirSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Pointers`))
			{
				const pointerFile = fs.readFileSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Pointers/${file}`);
				const pointer = BSON.deserialize(pointerFile);

				if (Reference === pointer.Reference)
				{
					Pointer = pointer;
				}
			}
		}

		const end = Date.now();

		console.log(colors.gray("Get Pointer ") + ((end - start) > 10 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));

		return Pointer;
	}

	/**
	 * @public
	 * @param {string} Container - Container ID
	 * @description Get Container
	 * @returns {BSON.Document}
	 */
	public GetContainer(Container: string): BSON.Document | undefined
	{
		const start = Date.now();
		
		if (!fs.existsSync(__dirname + `/${this.Options.Path}`))
			throw new Error("(ODB-01) The path you specified was not found.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB`))
			throw new Error("(ODB-02) The database root folder not exists.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}`))
			throw new Error("(ODB-03) This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.");


		if (!this.Containers.get(Container))
		{
			let container = undefined;

			for (const file of fs.readdirSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers`))
			{
				const pointerFile = fs.readFileSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers/${file}`);
				const x = BSON.deserialize(pointerFile);

				if (x.ID === Container)
				{
					container = x;
				}
			}

			const end = Date.now();

			console.log(colors.gray("Get Container ") + ((end - start) > 10 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));

			return container;

		} else
		{
			const end = Date.now();

			console.log(colors.gray("Get Container ") + ((end - start) > 10 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));


			return this.Containers.get(Container);
		}
	}
	
	/**
	 * @public
	 * @async
	 * @param {Push} Content - Push content
	 * @param {Reference} Reference - Reference to find the pointer easier
	 * @param {(number|string)} id - Table ID
	 * @param {string} [Container=false] - Container ID
	 * @description Push data to container
	 * @returns {Promise<void>}
	 */
	public async Push<T extends Push>(Content: T, Reference: Reference, id?: number | string, Container?: string): Promise<void>
	{
		const start = Date.now();

		if (!fs.existsSync(__dirname + `/${this.Options.Path}`))
			throw new Error("(ODB-01) The path you specified was not found.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB`))
			throw new Error("(ODB-02) The database root folder not exists.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}`))
			throw new Error("(ODB-03) This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.");

		const pointer = this.GetPointer(Reference);

		if (pointer === undefined)
			throw new Error("(ODB-05) Pointer not found.");

		if (!Container)
		{
			let container = undefined;

			if (!this.Containers.get(pointer.Containers[0]))
			{
				for (const file of fs.readdirSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers`))
				{
					const pointerFile = fs.readFileSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers/${file}`);
					const x = BSON.deserialize(pointerFile);

					if (x.ID === pointer.Containers[0])
					{
						container = x;
					}
				}
			} else container = this.Containers.get(pointer.Containers[0])

			if (!container)
				throw new Error("(ODB-06) Container not found");

			if (id === undefined)
			{
				const content = {
					ID: uid(6),
					Content
				}

				container.Tables.push(content);
			}
			else
			{
				container.Tables.forEach((x: any) =>
				{
					if (x.ID === id)
						throw new Error("(ODB-07) The id is already in use.");
				});

				const content = {
					ID: id,
					Content
				}

				container.Tables.push(content);
			}

			container = {
				ID: container.ID,
				Tables: container.Tables
			};

			this.Containers.set(container.ID, container);

			const end = Date.now();

			console.log(colors.gray("Push ") + ((end - start) > 500 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));

			await fs.promises.writeFile(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers/${container.ID}.bson`, BSON.serialize(container))
				.catch((error) =>
				{
					if (error) this.emit("error", error);
				});
		}
		else
		{
			let container = undefined;

			if (!this.Containers.get(Container))
			{
				for (const file of fs.readdirSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers`))
				{
					const pointerFile = fs.readFileSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers/${Container}`);
					const x = BSON.deserialize(pointerFile);

					if (x.ID === Container)
					{
						container = x;
					}
				}
			} else container = this.Containers.get(Container);

			if (!container)
				throw new Error("(ODB-06) Container not found");

			if (!id)
			{
				const content = {
					ID: container.Tables.length == 0 ? 1 : container.Tables.length + 1,
					Content
				}

				container.Tables.push(content);
			}
			else
			{
				container.Tables.forEach((x: any) =>
				{
					if (x.ID === id)
						throw new Error("(ODB-07) The id is already in use.");
				});

				const content = {
					ID: id,
					Content
				}

				container.Tables.push(content);
			}

			container = {
				ID: container.ID,
				Tables: container.Tables
			};

			this.Containers.set(container.ID, container);

			const end = Date.now();

			console.log(colors.gray("Push ") + ((end - start) > 10 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));

			await fs.promises.writeFile(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers/${container.ID}.bson`, BSON.serialize(container))
				.catch((error) =>
				{
					if (error) this.emit("error", error);
				});
		}
	}

	/**
	 * @public
	 * @param {Reference} Reference - Reference to find the pointer easier
	 * @param {string} [Container=false] - Container ID
	 * @description Add an existing container or not, to a pointer
	 * @returns {void}
	 */
	public AddContainer(Reference: Reference, Container?: string | null): void
	{
		if (!fs.existsSync(__dirname + `/${this.Options.Path}`))
			throw new Error("(ODB-01) The path you specified was not found.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB`))
			throw new Error("(ODB-02) The database root folder not exists.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}`))
			throw new Error("(ODB-03) This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.");

		const Pointer = this.GetPointer(Reference);
		const containers = [];

		if (typeof Pointer === "undefined" || !Pointer)
			throw new Error("(ODB-05) Pointer not found");

		if (typeof Container === "string")
		{
			if (Container.length !== 18)
				throw new Error("(ODB-10) This ID is not correct");

			if (!this.Containers.get(Container))
				throw new Error("(ODB-10) This ID is not correct");

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
	
	/**
	 * @public
	 * @async
	 * @param {Reference} Reference - Reference to find the pointer easier
	 * @param {(number|string|null)} KeyName - Key name to search the container
	 * @param {Push} KeyValue - Key value to search the container
	 * @param {Push} Value - Value to define
	 * @param {number} [TableId=false] - Table ID
	 * @param {string} [Container=false] - Container ID
	 * @description Edit a key in the container
	 * @returns {Promise<void>}
	 */
	public async Edit<T extends Push>(Reference: Reference, KeyName: number | string | null, KeyValue: T, Value: T, TableId?: number, Container?: string): Promise<void> 
	{
		const start = Date.now();
		
		if (!fs.existsSync(__dirname + `/${this.Options.Path}`))
			throw new Error("(ODB-01) The path you specified was not found.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB`))
			throw new Error("(ODB-02) The database root folder not exists.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}`))
			throw new Error("(ODB-03) This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.");
		
		const _pointer = this.GetPointer(Reference);
	
		if (typeof _pointer === "undefined" || !_pointer)
			throw new Error("(ODB-05) Pointer not found");
		
		if (typeof Container === "string")
		{
			if (Container.length !== 18)
				throw new Error("(ODB-10) This ID is not correct");
			
			const _container = this.Containers.get(Container);
			let found = false;
	
			if (!_container)
				throw new Error("(ODB-10) This ID is not correct");
			
			_container.Tables.forEach((x: any, i: number) =>
			{
				if (typeof TableId === "number") 
				{
					if (x.ID === TableId) 
					{
						if (typeof x.Content === "string" || Array.isArray(x.Content) || typeof x.Content === "number" && KeyName === null) 
						{
							if (x.Content === KeyValue)
							{
								found = true;
								x.Content = Value;
							}
						} 
						else if (typeof x.Content === "object" && KeyName != null) 
						{
							if (x.Content[KeyName] === KeyValue)
							{
								found = true;
								x.Content[KeyName] = Value;
							}
						}
					}
				} 
				else 
				{
					if (typeof x.Content === "string" || Array.isArray(x.Content) || typeof x.Content === "number" && KeyName === null) 
					{
						if (x.Content === KeyValue)
						{
							found = true;
							x.Content = Value;
						}
					} 
					else if (typeof x.Content === "object" && KeyName != null) 
					{
						if (x.Content[KeyName] === KeyValue)
						{
							found = true;
							x.Content[KeyName] = Value;
						}
					}
				}
			});
			
			if (!found)
				throw new Error("(ODB-08) Key not found");

			let container = {
				ID: _container.ID,
				Tables: _container.Tables
			};

			this.Containers.set(container.ID, container);

			const end = Date.now();

			console.log(colors.gray("Edit key ") + ((end - start) > 10 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));

			await fs.promises.writeFile(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers/${container.ID}.bson`, BSON.serialize(container))
				.catch((error) =>
				{
					if (error) this.emit("error", error);
				});
		}
		else 
		{
			_pointer.Containers.forEach(async (x: any) => {
				const _container = this.Containers.get(x);
				let found = false;
	
				if (!_container)
					throw new Error("This ID is not correct");
				
				_container.Tables.forEach((x: any, i: number) =>
				{
					if (typeof TableId === "number") 
					{
						if (x.ID === TableId) 
						{
							if (typeof x.Content === "string" || Array.isArray(x.Content) || typeof x.Content === "number" && KeyName === null) 
							{
								if (x.Content === KeyValue)
								{
									found = true;
									x.Content = Value;
								}
							} 
							else if (typeof x.Content === "object" && KeyName != null) 
							{
								if (x.Content[KeyName] === KeyValue)
								{
									found = true;
									x.Content[KeyName] = Value;
								}
							}
						}
					} 
					else 
					{
						if (typeof x.Content === "string" || Array.isArray(x.Content) || typeof x.Content === "number" && KeyName === null) 
						{
							if (x.Content === KeyValue)
							{
								found = true;
								x.Content = Value;
							}
						} 
						else if (typeof x.Content === "object" && KeyName != null) 
						{
							if (x.Content[KeyName] === KeyValue)
							{
								found = true;
								x.Content[KeyName] = Value;
							}
						}
					}
				});
				
				if (!found)
					throw new Error("(ODB-08) Key not found");

				let container = {
					ID: _container.ID,
					Tables: _container.Tables
				};

				this.Containers.set(container.ID, container);

				const end = Date.now();

				console.log(colors.gray("Edit key ") + ((end - start) > 10 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));

				await fs.promises.writeFile(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers/${container.ID}.bson`, BSON.serialize(container))
					.catch((error) =>
					{
						if (error) this.emit("error", error);
					});
			});
		}		
	}

	/**
	 * @public
	 * @async
	 * @param {Reference} Reference - Reference to find the pointer easier
	 * @param {number} TableId - Table ID
	 * @param {string} [Container=false] - Container ID
	 * @description Delete Table
	 * @returns {Promise<void>}
	 */
	public async DeleteTable(Reference: Reference, TableId: number, Container?: string): Promise<void>
	{
		const start = Date.now();

		if (!fs.existsSync(__dirname + `/${this.Options.Path}`))
			throw new Error("(ODB-01) The path you specified was not found.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB`))
			throw new Error("(ODB-02) The database root folder not exists.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}`))
			throw new Error("(ODB-03) This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.");

		const pointer = this.GetPointer(Reference);

		if (pointer === undefined)
			throw new Error("(ODB-05) Pointer not found.");

		let container: any = undefined;

		if (Container === undefined)
		{
			let found = false;
			
			pointer.Containers.forEach((x: string) =>
			{
				const _container = this.GetContainer(x);

				if (_container === undefined)
					throw new Error("(ODB-06) Container not found");
				
				_container.Tables.forEach((x: ContainerTable, i: number) => {
					if (x.ID === TableId) 
					{
						found = true;
						delete _container.Tables[i];
					}
				});

				container = {
					ID: _container.ID,
					Tables: _container.Tables
				};
			});

			if (!found)
				throw new Error("(ODB-08) Key not found");

			this.Containers.set(container.ID, container);

			const end = Date.now();

			console.log(colors.gray("Delete key ") + ((end - start) > 500 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));

			await fs.promises.writeFile(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers/${container.ID}.bson`, BSON.serialize(container))
				.catch((error) =>
				{
					if (error) this.emit("error", error);
				});
		}
		else
		{
			const _container = this.GetContainer(Container);
			let found = false;

			if (_container === undefined)
				throw new Error("(ODB-06) Container not found");

			_container.Tables.forEach((x: ContainerTable, i: number) => {
				if (x.ID === TableId) 
				{
					found = true;
					delete _container.Tables[i];
				}
			});

			container = {
				ID: _container.ID,
				Tables: _container.Tables
			};

			if (!found)
				throw new Error("(ODB-08) Key not found");

			this.Containers.set(container.ID, container);

			const end = Date.now();

			console.log(colors.gray("Delete key ") + ((end - start) > 500 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));

			await fs.promises.writeFile(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers/${container.ID}.bson`, BSON.serialize(container))
				.catch((error) =>
				{
					if (error) this.emit("error", error);
				});
		}
	}
	
	/**
	 * @public
	 * @async
	 * @param {Reference} Reference - Reference to find the pointer easier
	 * @param {(string | number | null)} KeyName - Key name to search the container
	 * @param {Push} KeyValue - Key value to search the container
	 * @param {string} [Container=false] - Container ID
	 * @description Delete Table by Key
	 * @returns {Promise<void>}
	 */
	public async DeleteTableByKey<T extends Push>(Reference: Reference, KeyName: string | number | null, KeyValue: T, Container?: string): Promise<void>
	{
		const start = Date.now();

		if (!fs.existsSync(__dirname + `/${this.Options.Path}`))
			throw new Error("(ODB-01) The path you specified was not found.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB`))
			throw new Error("(ODB-02) The database root folder not exists.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}`))
			throw new Error("(ODB-03) This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.");

		const pointer = this.GetPointer(Reference);

		if (pointer === undefined)
			throw new Error("(ODB-05) Pointer not found.");

		let container: any = undefined;

		if (Container === undefined)
		{
			let found = false;
			pointer.Containers.forEach((x: string) =>
			{
				const _container = this.GetContainer(x);

				if (_container === undefined)
					throw new Error("(ODB-06) Container not found");

				_container.Tables.forEach((x: any, i: number) =>
				{
					
					if (typeof x.Content === "string" || Array.isArray(x.Content) || typeof x.Content === "number" && KeyName === null) 
					{
						if (x.Content === KeyValue)
						{
							found = true;
							delete _container.Tables[i];
						}
					} 
					else if (typeof x.Content === "object" && KeyName != null) 
					{
						if (x.Content[KeyName] === KeyValue)
						{
							found = true;
							delete _container.Tables[i];
						}
					}
				});

				container = {
					ID: _container.ID,
					Tables: _container.Tables
				};
			});

			if (!found)
				throw new Error("(ODB-08) Key not found");

			this.Containers.set(container.ID, container);

			const end = Date.now();

			console.log(colors.gray("Delete key ") + ((end - start) > 500 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));

			await fs.promises.writeFile(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers/${container.ID}.bson`, BSON.serialize(container))
				.catch((error) =>
				{
					if (error) this.emit("error", error);
				});
		}
		else
		{
			const _container = this.GetContainer(Container);
			let found = false;

			if (_container === undefined)
				throw new Error("(ODB-06) Container not found");

			_container.Tables.forEach((x: any, i: number) =>
			{
				if (typeof x.Content === "string" || Array.isArray(x.Content) || typeof x.Content === "number" && KeyName === null) 
				{
					if (x.Content === KeyValue)
					{
						found = true;
						delete _container.Tables[i];
					}
				} 
				else if (typeof x.Content === "object" && KeyName != null) 
				{
					if (x.Content[KeyName] === KeyValue)
					{
						found = true;
						delete _container.Tables[i];
					}
				}
			});

			container = {
				ID: _container.ID,
				Tables: _container.Tables
			};

			if (!found)
				throw new Error("(ODB-08) Key not found");

			this.Containers.set(container.ID, container);

			const end = Date.now();

			console.log(colors.gray("Delete key ") + ((end - start) > 500 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));

			await fs.promises.writeFile(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers/${container.ID}.bson`, BSON.serialize(container))
				.catch((error) =>
				{
					if (error) this.emit("error", error);
				});
		}
	}

	/**
	 * @public
	 * @async
	 * @param {Reference} Reference - Reference to find the pointer easier
	 * @param {(number|string|null)} KeyName - Key name to search the container
	 * @param {Push} KeyValue - Key value to search the container
	 * @param {string} [Container=false] - Container ID
	 * @description Delete Key
	 * @returns {Promise<void>}
	 */
	public async DeleteKey<T extends Push>(Reference: Reference, KeyName: string | number | null, KeyValue: T, Container?: string): Promise<void>
	{
		const start = Date.now();

		if (!fs.existsSync(__dirname + `/${this.Options.Path}`))
			throw new Error("(ODB-01) The path you specified was not found.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB`))
			throw new Error("(ODB-02) The database root folder not exists.");

		if (!fs.existsSync(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}`))
			throw new Error("(ODB-03) This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.");

		const pointer = this.GetPointer(Reference);

		if (pointer === undefined)
			throw new Error("(ODB-05) Pointer not found.");

		let container: any = undefined;

		if (Container === undefined)
		{
			let found = true;
			
			pointer.Containers.forEach((x: string) =>
			{
				const _container = this.GetContainer(x);

				if (_container === undefined)
					throw new Error("(ODB-06) Container not found");

				_container.Tables.forEach((x: any) =>
				{
					if (typeof x.Content === "string" || Array.isArray(x.Content) || typeof x.Content === "number" && KeyName === null) 
					{
						if (x.Content === KeyValue)
						{
							found = true;
							delete x.Content;
						}
					} 
					else if (typeof x.Content === "object" && KeyName != null) 
					{
						if (x.Content[KeyName] === KeyValue)
						{
							found = true;
							delete x.Content[KeyName];
						}
					}
				});

				container = {
					ID: _container.ID,
					Tables: _container.Tables
				};
			});

			if (!found)
				throw new Error("(ODB-08) Key not found");

			this.Containers.set(container.ID, container);

			const end = Date.now();

			console.log(colors.gray("Delete key ") + ((end - start) > 500 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));

			await fs.promises.writeFile(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers/${container.ID}.bson`, BSON.serialize(container))
				.catch((error) =>
				{
					if (error) this.emit("error", error);
				});
		}
		else
		{
			const _container = this.GetContainer(Container);
			let found = false;

			if (_container === undefined)
				throw new Error("(ODB-06) Container not found");

			_container.Tables.forEach((x: any) =>
			{
				if (typeof x.Content === "string" || Array.isArray(x.Content) || typeof x.Content === "number" && KeyName === null) 
				{
					if (x.Content === KeyValue)
					{
						found = true;
						delete x.Content;
					}
				} 
				else if (typeof x.Content === "object" && KeyName != null) 
				{
					if (x.Content[KeyName] === KeyValue)
					{
						found = true;
						delete x.Content[KeyName];
					}
				}	
			});

			container = {
				ID: _container.ID,
				Tables: _container.Tables
			};

			if (!found)
				throw new Error("(ODB-08) Key not found");

			this.Containers.set(container.ID, container);

			const end = Date.now();

			console.log(colors.gray("Delete key ") + ((end - start) > 500 ? colors.yellow(`${end - start}ms`) : colors.green(`${end - start}ms`)));

			await fs.promises.writeFile(__dirname + `/${this.Options.Path}/OpenDB/${this.Database}/Containers/${container.ID}.bson`, BSON.serialize(container))
				.catch((error) =>
				{
					if (error) this.emit("error", error);
				});
		}
	}
}
