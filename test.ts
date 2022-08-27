import chalk from "chalk";
import MARC from "./marc.js";
import Express from "express"

const app = Express()
const marc = new MARC({
  name: "MARC",                                     //* Logger Name
  cleanUp: true,                                    //* Removes all log files then creates new ones instead. dont use with code files all removes.
  types: [{
    name: "TEST",                                   //* Type Name Used at line:36
    hexColor: chalk.bgBlueBright,                   //* Type Color 
    textSequence: "\\/%N - %TP\\/ > \"%T\" > %D",   /**
     *? Text sequence.
     * %TP Debug Type [Required]
     * %N  Logger Name
     * %T  Time
     * %D  Data Text [Required]
     *
     * %PD Process ID (PID)
     * %PP Process Platform
     * %PA Process Arch
     * %NV Node Version
     * %PU Process User
   */
    textColor: chalk.bgRed                          //* Type Text Color
  }],
  logDir: process.cwd() + "/logs/",                 //* Select Log directory
  object2string: true,                              //* Converts objects to string 
  useDefaultTypes: true                             //* Use default types [INFO, DEBUG, ERROR]
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

(async () => {
  try {
    await marc.start();
    await marc.log("INFO", "info test",testFunc);
    await marc.log("DEBUG", "debug test", testData, testFunc);
    await marc.log("TEST", "ooOOOOOOoo")
  } catch (e) {
    console.log(e)
  }
})();

app.use(marc.express())
app.get("/", (req: Express.Request, res: Express.Response) => {
  res.send("essa")
})

app.listen(3000)