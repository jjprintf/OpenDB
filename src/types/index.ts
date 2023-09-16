export type ErrorClient = string | number | object | undefined;

export type ClientOptions = {
	Path?: string,
}

export type Pointer = {
	ID: string,
	Reference: string | number,
	Containers: string[]
}

export type AnyArray = object[] | string[] | number[];

export type Push = string | object | AnyArray | number;

export type Container = 
{
	ID: string,
	Tables: ContainerTable[]
}

export type ContainerTable = 
{
	ID: number
	Content: Push
}