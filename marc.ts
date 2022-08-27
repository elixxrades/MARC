import * as fs from "fs";
import { remove } from "fs-extra";
import * as express from "express"
import chalk, { ChalkInstance } from "chalk";

export interface ITypes {
  name: string;
  hexColor: ChalkInstance;
  textSequence: string;
  textColor?: ChalkInstance;
}

export interface IOptions {
  name: string;
  types?: ITypes[];
  cleanUp?: boolean;
  object2string?: boolean;
  logDir?: string;
  useDefaultTypes?: boolean;
}

export default class MARC {
  private loggerName;
  private object2string;
  private logDir;
  private cleanUp;
  private types = [] as ITypes[];
  private defaultTypes = [] as ITypes[];

  constructor(options: IOptions) {
    this.loggerName = options.name;
    this.logDir = options.logDir ? options.logDir : process.cwd() + "/marc-logs/";
    this.cleanUp = options.cleanUp ? options.cleanUp : false;
    this.object2string = options.object2string ? options.object2string : false;
    this.types = options.types ? options.types : []
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

  async start() {
    await this.checkFiles();
    if (this.types.length === 0) return new Error("Please add types or use setting `useDefaultTypes:true`")
    await this.logWithTime("MARC Started.");
  }

  async log(type: string, text: string, data?: any, fc?: Function) {
    return new Promise((resolve, reject) => {
      var tps = this.types.find((x) => x.name === type);
      if (!tps) return reject(new Error("Please input valid type. Active types: " + this.types.map(x => x.name).join(", ")))

      var time = this.getTime()

      if (!text) return reject(new Error("Text required."));

      if (data) {
        data = this.convert2string(data)
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
        .replace("%PU", process.env.user)

      console.log(et, data ? data : chalk.red.bold("- No Data"));

      this.write2file(type, text, data)

      if (fc) fc()
      resolve({
        tps, text
      })
    });
  }

  public express() {
    var x = this
    return function (req: express.Request, res: express.Response, next: express.NextFunction) {
      if (x.types.length === 0 || !x.types.find(y => y.name === "DEBUG")) return new Error("Default types is not active. Please active this option.")
      var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      x.log("DEBUG", `${req.method} - ${ip} -`,req.url)
      next();
    }
  }

  private async write2file(type: string, text: string, data: any) {
    var ctx = `\n${type.toUpperCase()} - ${this.getTime()} - ${text}`
    if (!data) this.appendText(this.logDir + type + ".log", ctx + "\n")
    else {
      this.convert2string(data)
      this.appendText(this.logDir + type + ".log", ctx + ": \n" + data + "\n")
    }
  }

  private async checkFiles() {
    var rootdir = fs.readdirSync(process.cwd());
    var logdir = this.logDir;
    if (rootdir.includes(this.logDir.replace(process.cwd() + "/", "").replace("/", ""))) {
      this.logWithTime("MARC log folder founded.");
      if (this.cleanUp) {
        this.cleanUpMde();
      }
    } else {
      this.logWithTime("MARC log folder not founded.");
      fs.mkdirSync(logdir);
    }

    await this.delay(200);
    await this.createFiles();
  }

  private async cleanUpMde() {
    this.logWithTime("MARC Cleanup started.");

    remove(this.logDir);

    await this.delay(200);

    this.createFolder(this.logDir);
    this.logWithTime("MARC Cleanup finished.");
  }

  private createFiles() {
    var rootdir = fs.readdirSync(this.logDir);
    this.types.forEach((x) => {
      var dt = rootdir.find(y => y === x.name + ".log")
      if (!dt) {
        this.appendText(this.logDir + x.name + ".log", this.getTime() + "\n");
        this.logWithTime('MARC log file "' + x.name + '" created.');
      }
    });
  }

  private convert2string(data: any) {
    if (typeof data === "object" && this.object2string) data = JSON.stringify(data);
    if (typeof data === "function") data = data.toString()
    if (typeof data === "number") data = data.toString()
    return data
  }

  private getTime() {
    return `${new Date().toLocaleString()}`;
  }

  private appendText(path, data) {
    return fs.appendFile(path, data, null, function () { });
  }

  private createFolder(path) {
    return fs.mkdirSync(path);
  }

  private logWithTime(text) {
    return console.log(this.getTime() + " - " + text);
  }

  public delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
}
