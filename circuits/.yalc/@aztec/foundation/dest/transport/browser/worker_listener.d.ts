/// <reference types="node" resolution-mode="require"/>
import EventEmitter from 'events';
import { Listener } from '../interface/listener.js';
declare interface DedicatedWorkerGlobalScope {
    onmessage: (...args: any) => any;
}
export declare class WorkerListener extends EventEmitter implements Listener {
    private worker;
    constructor(worker: DedicatedWorkerGlobalScope);
    open(): void;
    close(): void;
    private handleMessageEvent;
}
export {};
//# sourceMappingURL=worker_listener.d.ts.map