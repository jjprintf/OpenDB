/* eslint-disable multiline-ternary */
/* eslint-disable no-delete-var */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable key-spacing */
import fs from 'node:fs';

import BSON from 'bson';

import { uid } from 'uid';

import { Emitter } from './NodeEmitter';

import { ClientOptions, Pointer, TypeResolvable, Container, ContainerTable } from '../types';

import parsePath from '../helpers/parsePath';

import parseSrc from '../helpers/parseSrc';

import path from 'path'; 

export interface Client
{
	Options: ClientOptions;

	Database: string;

	Pointers: Map<string, Pointer>;

	Containers: Map<string, Container>;
	
	Path: string[];
}

export class Client
{
	/**
	 * @typedef {Object} ClientOptions
	 * @property {string=} Path
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
	constructor(Options: ClientOptions)
	{
		this.Options = Options;

		if (typeof this.Options.Path === "undefined" || !this.Options.Path)
		{
			this.Options.Path = parseSrc();
		}
		else
		{
			this.Options.Path = path.join(...parsePath(this.Options.Path));
		}

		this.Database = "none";

		this.Pointers = new Map();
		this.Containers = new Map();

		BSON.setInternalBufferSize(500);

		Emitter.emit("start");
	}

	private CheckFolders(): void
	{
		if(typeof this.Options.Path === "undefined")
			throw new Error("An error occurred and the path was not specified.");
		
		if (!fs.existsSync(this.Options.Path))
			throw new Error("(ODB-01) The path you specified was not found.");

		if (!fs.existsSync(path.join(this.Options.Path, 'OpenDB')))
			throw new Error("(ODB-02) The database root folder not exists.");

		if (!fs.existsSync(path.join(this.Options.Path, 'OpenDB', this.Database)))
			throw new Error("(ODB-03) This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.");
	}

	/**
	 * @public
	 * @async
	 * @description Create root folder
	 * @returns {Promise<this>}
	 */
	public async Start(): Promise<this>
	{
		if (typeof this.Options.Path === "undefined")
			throw new Error("An error occurred and the path was not specified.");

		if (!fs.existsSync(this.Options.Path))
			throw new Error("(ODB-01) The path you specified was not found.");

		if (fs.existsSync(path.join(this.Options.Path, 'OpenDB')))
		{
			console.log("(Warn-01) The root folder already exists, nothing will be created and this function will be skipped.");

			return this;
		}

		await fs.promises.mkdir(path.join(this.Options.Path, 'OpenDB'), { recursive: true })
			.catch((Error) =>
			{
				if (Error) Emitter.emit("error", Error);
			});

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
		if (typeof this.Options.Path === "undefined")
			throw new Error("An error occurred and the path was not specified.");
		
		if (!fs.existsSync(this.Options.Path))
			throw new Error("(ODB-01) The path you specified was not found.");

		if (!fs.existsSync(path.join(this.Options.Path, 'OpenDB')))
			throw new Error("(ODB-02) The database root folder not exists.");

		if (fs.existsSync(path.join(this.Options.Path, 'OpenDB', Name)))
		{
			console.log("(Warn-02) The database already exists.");

			return this;
		}

		await fs.promises.mkdir(path.join(this.Options.Path, 'OpenDB', Name), { recursive: true })
			.catch((Error) =>
			{
				if (Error) Emitter.emit("error", Error);
			});

		await fs.promises.mkdir(path.join(this.Options.Path, 'OpenDB', Name, 'Pointers'), { recursive: true })
			.catch((Error) =>
			{
				if (Error) Emitter.emit("error", Error);
			});

		await fs.promises.mkdir(path.join(this.Options.Path, 'OpenDB', Name, 'Containers'), { recursive: true })
			.catch((Error) =>
			{
				if (Error) Emitter.emit("error", Error);
			});

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
			if (!fs.existsSync(this.Options.Path))
				throw new Error("(ODB-01) The path you specified was not found.");

			if (fs.existsSync(path.join(this.Options.Path, 'OpenDB')))
			{
				if (!fs.existsSync(path.join(this.Options.Path, 'OpenDB', Name)))
					throw new Error("(ODB-03) This database does not exist, read https://github.com/PrintfDead/OpenDB#readme to know how to fix this error.");
			}
			else
			{
				throw new Error("(ODB-02) The database root folder not exists.");
			}
		} 
		else if (typeof this.Options.Path === "undefined")
			throw new Error("An error occurred and the path was not specified.");

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
			for (const file of fs.readdirSync(path.join(this.Options.Path, 'OpenDB', Name, 'Pointers'), { recursive: true }))
			{
				const pointerFile = fs.readFileSync(path.join(this.Options.Path, 'OpenDB', Name, 'Pointers', file as string));
				const pointer = BSON.deserialize(pointerFile);

				const pointerDoc: Pointer = {
					ID: pointer.ID,
					Reference: pointer.Reference,
					Containers: pointer.Containers
				};

				this.Pointers.set(pointer.ID, pointerDoc);
			}

			for (const file of fs.readdirSync(path.join(this.Options.Path, 'OpenDB', Name, 'Containers'), { recursive: true }))
			{
				const containerFile = fs.readFileSync(path.join(this.Options.Path, 'OpenDB', Name, 'Containers', file as string));

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
		
		return this;
	}

	/**
	 * @public
	 * @async
	 * @param {(string|number)} Reference - Reference to find the pointer easier
	 * @description Create pointer
	 * @returns {Promise<void>}
	 */
	public async CreatePointer(Reference: string | number): Promise<void>
	{
		this.CheckFolders();
		
		if (typeof this.Options.Path === "undefined")
			throw new Error("An error occurred and the path was not specified.");
		
		if (this.Database === "none") 
			throw new Error("(ODB-10) The database is not configured.");

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

		await fs.promises.writeFile(path.join(this.Options.Path, 'OpenDB', this.Database, 'Pointers', IDPointer+'.bson'), BSON.serialize(pointer))
			.catch((error) =>
			{
				if (error) Emitter.emit("error", error);
			});

		await fs.promises.writeFile(path.join(this.Options.Path, 'OpenDB', this.Database, 'Containers', IDContainer+'.bson'), BSON.serialize(container))
			.catch((error) =>
			{
				if (error) Emitter.emit("error", error);
			});

		this.Pointers.set(IDPointer, pointer);
		this.Containers.set(IDContainer, container);
	}

	/**
	 * @public
	 * @param {(string|number)} Reference - Reference to find the pointer easier
	 * @description Get pointer
	 * @returns {BSON.Document}
	 */
	public GetPointer(Reference: string | number): BSON.Document | undefined
	{
		this.CheckFolders();
		
		if (typeof this.Options.Path === "undefined")
			throw new Error("An error occurred and the path was not specified.");
		
		if (this.Database === "none") 
			throw new Error("(ODB-10) The database is not configured.");

		let _pointer = undefined;

		this.Pointers.forEach((x) =>
		{
			if (x.Reference === Reference)
			{
				_pointer = x;
			}
		});

		if (_pointer === undefined)
		{
			for (const file of fs.readdirSync(path.join(this.Options.Path, 'OpenDB', this.Database, 'Pointers')))
			{
				const pointerFile = fs.readFileSync(path.join(this.Options.Path, 'OpenDB', this.Database, 'Pointers', file as string));
				const pointer = BSON.deserialize(pointerFile);

				if (Reference === pointer.Reference)
				{
					_pointer = pointer;
				}
			}
		}

		return _pointer;
	}

	/**
	 * @public
	 * @param {string} Container - Container ID
	 * @description Get Container
	 * @returns {BSON.Document}
	 */
	public GetContainer(Container: string): BSON.Document | undefined
	{
		this.CheckFolders();
		
		if (typeof this.Options.Path === "undefined")
			throw new Error("An error occurred and the path was not specified.");
		
		if (this.Database === "none") 
			throw new Error("(ODB-10) The database is not configured.");
		
		if (!this.Containers.get(Container))
		{
			let _container = undefined;

			for (const file of fs.readdirSync(path.join(this.Options.Path, 'OpenDB', this.Database, 'Containers')))
			{
				const pointerFile = fs.readFileSync(path.join(this.Options.Path, 'OpenDB', this.Database, 'Containers', file as string));
				const x = BSON.deserialize(pointerFile);

				if (x.ID === Container)
				{
					_container = x;
				}
			}

			return _container;

		} 
		else
		{
			return this.Containers.get(Container);
		}
	}
	
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
	public async Push<T extends TypeResolvable>(Content: T, Reference: string | number, id?: number | string, Container?: string): Promise<void>
	{
		this.CheckFolders();

		if (typeof this.Options.Path === "undefined")
			throw new Error("An error occurred and the path was not specified.");
		
		if (this.Database === "none") 
			throw new Error("(ODB-10) The database is not configured.");
		
		const pointer = this.GetPointer(Reference);

		if (pointer === undefined)
			throw new Error("(ODB-05) Pointer not found.");

		if (!Container)
		{
			let container = undefined;

			if (!this.Containers.get(pointer.Containers[0]))
			{
				for (const file of fs.readdirSync(path.join(this.Options.Path, 'OpenDB', this.Database, 'Containers')))
				{
					const pointerFile = fs.readFileSync(path.join(this.Options.Path, 'OpenDB', this.Database, 'Containers', file as string));
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

			await fs.promises.writeFile(path.join(this.Options.Path, 'OpenDB', this.Database, 'Containers', container.ID+'.bson'), BSON.serialize(container))
				.catch((error) =>
				{
					if (error) Emitter.emit("error", error);
				});
		}
		else
		{
			let container = undefined;

			if (!this.Containers.get(Container))
			{
				for (const file of fs.readdirSync(path.join(this.Options.Path, 'OpenDB', this.Database, 'Containers')))
				{
					const pointerFile = fs.readFileSync(path.join(this.Options.Path, 'OpenDB', this.Database, 'Containers', file as string));
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

			await fs.promises.writeFile(path.join(this.Options.Path, 'OpenDB', this.Database, 'Containers', container.ID+'.bson'), BSON.serialize(container))
				.catch((error) =>
				{
					if (error) Emitter.emit("error", error);
				});
		}
	}

	/**
	 * @public
	 * @param {(string|number)} Reference - Reference to find the pointer easier
	 * @param {string} [Container=false] - Container ID
	 * @description Add an existing container or not, to a pointer
	 * @returns {void}
	 */
	public async AddContainer(Reference: string | number, Container?: string | null): Promise<void>
	{
		this.CheckFolders();
		
		if (typeof this.Options.Path === "undefined")
			throw new Error("An error occurred and the path was not specified.");
		
		if (this.Database === "none") 
			throw new Error("(ODB-10) The database is not configured.");
		
		const Pointer = this.GetPointer(Reference);
		const containers = [];

		if (typeof Pointer === "undefined" || !Pointer)
			throw new Error("(ODB-05) Pointer not found");

		if (typeof Container === "string")
		{
			if (Container.length !== 18)
				throw new Error("(ODB-09) This ID is not correct");

			if (!this.Containers.get(Container))
				throw new Error("(ODB-09) This ID is not correct");

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

			fs.writeFile(path.join(this.Options.Path, 'OpenDB', this.Database, 'Containers', ID+'.bson'), BSON.serialize(container), (error) =>
			{
				if (error) Emitter.emit("error", error);
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

		await fs.promises.writeFile(path.join(this.Options.Path, 'OpenDB', this.Database, 'Pointers', pointer.ID+'.bson'), BSON.serialize(pointer))
			.catch((error) => 
			{
				if (error) Emitter.emit("error", error);
			});
	}
	
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
	public async Edit<T extends TypeResolvable>(Reference: string | number, KeyName: number | string | null, KeyValue: T, Value: T, TableId?: number, Container?: string): Promise<void> 
	{
		this.CheckFolders();
		
		if (typeof this.Options.Path === "undefined")
			throw new Error("An error occurred and the path was not specified.");
		
		if (this.Database === "none") 
			throw new Error("(ODB-10) The database is not configured.");

		const _pointer = this.GetPointer(Reference);
	
		if (typeof _pointer === "undefined" || !_pointer)
			throw new Error("(ODB-05) Pointer not found");
		
		if (typeof Container === "string")
		{
			if (Container.length !== 18)
				throw new Error("(ODB-09) This ID is not correct");
			
			const _container = this.Containers.get(Container);
			let found = false;
	
			if (!_container)
				throw new Error("(ODB-09) This ID is not correct");
			
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

			await fs.promises.writeFile(path.join(this.Options.Path, 'OpenDB', this.Database, 'Containers', container.ID+'.bson'), BSON.serialize(container))
				.catch((error) =>
				{
					if (error) Emitter.emit("error", error);
				});
		}
		else 
		{
			_pointer.Containers.forEach(async (x: any) => {
				if (typeof this.Options.Path === "undefined")
					throw new Error("An error occurred and the path was not specified.");
				
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

				await fs.promises.writeFile(path.join(this.Options.Path, 'OpenDB', this.Database, 'Containers', container.ID+'.bson'), BSON.serialize(container))
					.catch((error) =>
					{
						if (error) Emitter.emit("error", error);
					});
			});
		}		
	}
	
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
	public Find<T extends TypeResolvable>(Reference: string | number, KeyName: string | number | null, KeyValue: T, Container?: string): ContainerTable | undefined
	{
		this.CheckFolders();
		
		if (typeof this.Options.Path === "undefined")
			throw new Error("An error occurred and the path was not specified.");
		
		if (this.Database === "none") 
			throw new Error("(ODB-10) The database is not configured.");

		const _pointer = this.GetPointer(Reference);
	
		if (typeof _pointer === "undefined" || !_pointer)
			throw new Error("(ODB-05) Pointer not found");
		
		if (typeof Container === "string")
		{
			if (Container.length !== 18)
				throw new Error("(ODB-09) This ID is not correct");
			
			const _container = this.Containers.get(Container);
			let found = false;
			let table: ContainerTable | undefined;
	
			if (!_container)
				throw new Error("(ODB-09) This ID is not correct");
			
			_container.Tables.forEach((x: any, i: number) =>
			{
				if (typeof x.Content === "string" || Array.isArray(x.Content) || typeof x.Content === "number" && KeyName === null) 
				{
					if (x.Content === KeyValue)
					{
						found = true;
						table = x;
					}
				} 
				else if (typeof x.Content === "object" && KeyName != null) 
				{
					if (x.Content[KeyName] === KeyValue)
					{
						found = true;
						table = x;
					}
				}
			});
			
			if (!found || !table)
				throw new Error("(ODB-08) Key not found");
			
			return table;
		}
		else 
		{
			let table: ContainerTable | undefined;
			
			_pointer.Containers.forEach(async (x: any) => {
				const _container = this.Containers.get(x);
				let found = false;
	
				if (!_container)
					throw new Error("This ID is not correct");
				
				_container.Tables.forEach((x: any, i: number) =>
				{
					if (typeof x.Content === "string" || Array.isArray(x.Content) || typeof x.Content === "number" && KeyName === null) 
					{
						if (x.Content === KeyValue)
						{
							found = true;
							table = x;
						}
					} 
					else if (typeof x.Content === "object" && KeyName != null) 
					{
						if (x.Content[KeyName] === KeyValue)
						{
							found = true;
							table = x;
						}
					}
				});
				
				if (!found || !table)
					throw new Error("(ODB-08) Key not found");
			});
			
			return table;
		}
	}
	
	/**
	 * @public
	 * @async
	 * @param {(string|number)} Reference - Reference to find the pointer easier
	 * * @param {number} TableId - TableId ID
	 * @param {string} [Container=false] - Container ID
	 * @description Get table by a table id
	 * @returns {Promise<ContainerTable | undefined>}
	 */
	public Get(Reference: string | number, TableId: number, Container?: string): ContainerTable | undefined
	{
		this.CheckFolders();
		
		if (typeof this.Options.Path === "undefined")
			throw new Error("An error occurred and the path was not specified.");
		
		if (this.Database === "none") 
			throw new Error("(ODB-10) The database is not configured.");

		const _pointer = this.GetPointer(Reference);
	
		if (typeof _pointer === "undefined" || !_pointer)
			throw new Error("(ODB-05) Pointer not found");
		
		if (typeof Container === "string")
		{
			if (Container.length !== 18)
				throw new Error("(ODB-09) This ID is not correct");
			
			const _container = this.Containers.get(Container);
			let found = false;
			let table: ContainerTable | undefined;
	
			if (!_container)
				throw new Error("(ODB-09) This ID is not correct");
			
			_container.Tables.forEach((x: any, i: number) =>
			{
				if (x.ID === TableId) 
				{
					found = true;
					table = x;
				}
			});
			
			if (!found || !table)
				throw new Error("(ODB-08) Key not found");

			return table;
		}
		else 
		{
			let table: ContainerTable | undefined;
			
			_pointer.Containers.forEach(async (x: any) => {
				const _container = this.Containers.get(x);
				let found = false;
	
				if (!_container)
					throw new Error("This ID is not correct");
				
				_container.Tables.forEach((x: any, i: number) =>
				{
					if (x.ID === TableId) 
					{
						found = true;
						table = x;
					}
				});
				
				if (!found || !table)
					throw new Error("(ODB-08) Key not found");
			});
			
			return table;
		}
	}

	/**
	 * @public
	 * @async
	 * @param {(string|number)} Reference - Reference to find the pointer easier
	 * @param {number} TableId - Table ID
	 * @param {string} [Container=false] - Container ID
	 * @description Delete Table
	 * @returns {Promise<void>}
	 */
	public async DeleteTable(Reference: string | number, TableId: number, Container?: string): Promise<void>
	{
		this.CheckFolders();
		
		if (typeof this.Options.Path === "undefined")
			throw new Error("An error occurred and the path was not specified.");
		
		if (this.Database === "none") 
			throw new Error("(ODB-10) The database is not configured.");

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

			await fs.promises.writeFile(path.join(this.Options.Path, 'OpenDB', this.Database, 'Containers', container.ID+'.bson'), BSON.serialize(container))
				.catch((error) =>
				{
					if (error) Emitter.emit("error", error);
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

			await fs.promises.writeFile(path.join(this.Options.Path, 'OpenDB', this.Database, 'Containers', container.ID+'.bson'), BSON.serialize(container))
				.catch((error) =>
				{
					if (error) Emitter.emit("error", error);
				});
		}
	}
	
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
	public async DeleteTableByKey<T extends TypeResolvable>(Reference: string | number, KeyName: string | number | null, KeyValue: T, Container?: string): Promise<void>
	{
		this.CheckFolders();
		
		if (typeof this.Options.Path === "undefined")
			throw new Error("An error occurred and the path was not specified.");
		
		if (this.Database === "none") 
			throw new Error("(ODB-10) The database is not configured.");

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

			await fs.promises.writeFile(path.join(this.Options.Path, 'OpenDB', this.Database, 'Containers', container.ID+'.bson'), BSON.serialize(container))
				.catch((error) =>
				{
					if (error) Emitter.emit("error", error);
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

			await fs.promises.writeFile(path.join(this.Options.Path, 'OpenDB', this.Database, 'Containers', container.ID+'.bson'), BSON.serialize(container))
				.catch((error) =>
				{
					if (error) Emitter.emit("error", error);
				});
		}
	}

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
	public async DeleteKey<T extends TypeResolvable>(Reference: string | number, KeyName: string | number | null, KeyValue: T, Container?: string): Promise<void>
	{
		this.CheckFolders();
		
		if (typeof this.Options.Path === "undefined")
			throw new Error("An error occurred and the path was not specified.");
		
		if (this.Database === "none") 
			throw new Error("(ODB-10) The database is not configured.");

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

			await fs.promises.writeFile(path.join(this.Options.Path, 'OpenDB', this.Database, 'Containers', container.ID+'.bson'), BSON.serialize(container))
				.catch((error) =>
				{
					if (error) Emitter.emit("error", error);
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

			await fs.promises.writeFile(path.join(this.Options.Path, 'OpenDB', this.Database, 'Containers', container.ID+'.bson'), BSON.serialize(container))
				.catch((error) =>
				{
					if (error) Emitter.emit("error", error);
				});
		}
	}
}
