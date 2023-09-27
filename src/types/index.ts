export type ErrorClient = string | number | object | undefined;

export type ClientOptions = {
	Path?: string,
	Buffer?: number
}

export type Pointer = {
	ID: string,
	Reference: string | number,
	Containers: string[]
}

export type AnyArray = object[] | string[] | number[];

export type TypeResolvable = string | object | AnyArray | number;

export type Container = 
{
	ID: string,
	Tables: ContainerTable[]
}

export type ContainerTable = 
{
	ID: number | string,
	Content: TypeResolvable
}

export type PredicateType<T> = (value?: T, index?: number, array?: T[]) => unknown;