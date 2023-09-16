/// <reference types="node" />
import { ErrorClient } from '../types';
import { EventEmitter } from 'node:events';
export interface NodeEmitter {
    on(event: 'error', listener: (error: ErrorClient) => void): this;
    on(event: 'start', listener: () => void): this;
}
export declare class NodeEmitter extends EventEmitter {
    /**
     * @constructor
     */
    constructor();
}
export declare const Emitter: NodeEmitter;
