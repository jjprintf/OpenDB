import { ErrorClient } from '../types';
import { EventEmitter } from 'node:events';

export interface NodeEmitter {
	on(event: 'error', listener: (error: ErrorClient) => void): this;
	once(event: 'start', listener: () => void): this;
}

export class NodeEmitter extends EventEmitter 
{
	/**
	 * @constructor
	 */
	constructor() {
		super();
	}
}

export const Emitter = new NodeEmitter();