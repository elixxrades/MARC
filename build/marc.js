var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fs from "fs";
import { remove } from "fs-extra";
import chalk from "chalk";
export default class MARC {
    constructor(options) {
        this.types = [];
        this.defaultTypes = [];
        this.delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        this.loggerName = options.name;
        this.logDir = options.logDir ? options.logDir : process.cwd() + "/marc-logs/";
        this.cleanUp = options.cleanUp ? options.cleanUp : false;
        this.object2string = options.object2string ? options.object2string : false;
        this.types = options.types ? options.types : [];
        this.defaultTypes = options.useDefaultTypes ? [
            {
                name: "DEBUG",
                hexColor: chalk.gray,
                textSequence: "\\/%N - %TP\\/ > \"%T\" > %D",
                textColor: chalk.bold
            }, {
                name: "INFO",
                hexColor: chalk.blue,
                textSequence: "\\/%N - %TP\\/ > \"%T\" > %D",
                textColor: chalk.bold
            }, {
                name: "ERROR",
                hexColor: chalk.red,
                textSequence: "\\/%N - %TP\\/ > \"%T\" > %D",
                textColor: chalk.bold
            },
        ] : [];
        this.types = [...this.types, ...this.defaultTypes];
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkFiles();
            if (this.types.length === 0)
                return new Error("Please add types or use setting `useDefaultTypes:true`");
            yield this.logWithTime("MARC Started.");
        });
    }
    log(type, text, data, fc) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                var tps = this.types.find((x) => x.name === type);
                if (!tps)
                    return reject(new Error("Please input valid type. Active types: " + this.types.map(x => x.name).join(", ")));
                var time = this.getTime();
                if (!text)
                    return reject(new Error("Text required."));
                if (data) {
                    data = this.convert2string(data);
                }
                var et = tps.textSequence
                    .replace("%TP", tps.hexColor(tps.name))
                    .replace("%N", tps.hexColor(this.loggerName))
                    .replace("%T", this.getTime())
                    .replace("%D", tps.textColor ? tps.textColor(text) : chalk.bold(text))
                    .replace("%PD", process.pid.toString())
                    .replace("%PP", process.platform)
                    .replace("%PA", process.arch)
                    .replace("%NV", process.version)
                    .replace("%PU", process.env.user);
                console.log(et, data ? data : chalk.red.bold("- No Data"));
                this.write2file(type, text, data);
                if (fc)
                    fc();
                resolve({
                    tps, text
                });
            });
        });
    }
    express() {
        var x = this;
        return function (req, res, next) {
            if (x.types.length === 0 || !x.types.find(y => y.name === "DEBUG"))
                return new Error("Default types is not active. Please active this option.");
            var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            x.log("DEBUG", `${req.method} - ${ip} -`, req.url);
            next();
        };
    }
    write2file(type, text, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var ctx = `\n${type.toUpperCase()} - ${this.getTime()} - ${text}`;
            if (!data)
                this.appendText(this.logDir + type + ".log", ctx + "\n");
            else {
                this.convert2string(data);
                this.appendText(this.logDir + type + ".log", ctx + ": \n" + data + "\n");
            }
        });
    }
    checkFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            var rootdir = fs.readdirSync(process.cwd());
            var logdir = this.logDir;
            if (rootdir.includes(this.logDir.replace(process.cwd() + "/", "").replace("/", ""))) {
                this.logWithTime("MARC log folder founded.");
                if (this.cleanUp) {
                    this.cleanUpMde();
                }
            }
            else {
                this.logWithTime("MARC log folder not founded.");
                fs.mkdirSync(logdir);
            }
            yield this.delay(200);
            yield this.createFiles();
        });
    }
    cleanUpMde() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logWithTime("MARC Cleanup started.");
            remove(this.logDir);
            yield this.delay(200);
            this.createFolder(this.logDir);
            this.logWithTime("MARC Cleanup finished.");
        });
    }
    createFiles() {
        var rootdir = fs.readdirSync(this.logDir);
        this.types.forEach((x) => {
            var dt = rootdir.find(y => y === x.name + ".log");
            if (!dt) {
                this.appendText(this.logDir + x.name + ".log", this.getTime() + "\n");
                this.logWithTime('MARC log file "' + x.name + '" created.');
            }
        });
    }
    convert2string(data) {
        if (typeof data === "object" && this.object2string)
            data = JSON.stringify(data);
        if (typeof data === "function")
            data = data.toString();
        if (typeof data === "number")
            data = data.toString();
        return data;
    }
    getTime() {
        return `${new Date().toLocaleString()}`;
    }
    appendText(path, data) {
        return fs.appendFile(path, data, null, function () { });
    }
    createFolder(path) {
        return fs.mkdirSync(path);
    }
    logWithTime(text) {
        return console.log(this.getTime() + " - " + text);
    }
}
//# sourceMappingURL=marc.js.map