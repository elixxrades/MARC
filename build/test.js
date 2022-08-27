var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import chalk from "chalk";
import MARC from "./marc.js";
import Express from "express";
const app = Express();
const marc = new MARC({
    name: "MARC",
    cleanUp: true,
    types: [{
            name: "TEST",
            hexColor: chalk.bgBlueBright,
            textSequence: "\\/%N - %TP\\/ > \"%T\" > %D",
            textColor: chalk.bgRed
        }],
    logDir: process.cwd() + "/logs/",
    object2string: true,
    useDefaultTypes: true
});
var testData = {
    m: "a",
    r: "c",
    e: "l",
    i: "x"
};
var testFunc = function () {
    console.log("testfcrunned");
};
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield marc.start();
        yield marc.log("INFO", "info test", testFunc);
        yield marc.log("DEBUG", "debug test", testData, testFunc);
        yield marc.log("TEST", "ooOOOOOOoo");
    }
    catch (e) {
        console.log(e);
    }
}))();
app.use(marc.express());
app.get("/", (req, res) => {
    res.send("essa");
});
app.listen(3000);
//# sourceMappingURL=test.js.map