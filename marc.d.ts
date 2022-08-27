import { ITypes } from "./marc.js";

export declare class MARC {
    constructor(options: {
        name: string;
        types?: ITypes[];
        cleanUp?: boolean;
        object2string?: boolean;
        logDir?: string;
        useDefaultTypes?: boolean;
    });
    start();
    public log(type: string, text: string, data: any, fc: Function): void;
}
