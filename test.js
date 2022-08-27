const MARC = require("./build/marc.js");
const chalk = require("chalk");

const express = require("express");
const app = express();

const marc = new MARC({
  name: "MARC", //* Logger Name
  cleanUp: true, //* Removes all log files then creates new ones instead. dont use with code folder all removes.
  types: [
    {
      name: "TEST", //* Type Name Used at line:36
      hexColor: chalk.bgBlueBright, //* Type Color
      textSequence: '\\/%N - %TP\\/ > "%T" > %D',
      /**
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
       */ textColor: chalk.bgRed, //* Type Text Color
    },
  ],
  logDir: process.cwd() + "/logs/", //* Select Log directory
  object2string: true, //* Converts objects to string
  useDefaultTypes: true,
});

marc.start();

marc.log("TEST", "Node Version", process.version);
marc.log("INFO", "Arch", process.arch);
marc.log("DEBUG", "Cpu Usage", process.cpuUsage());
marc.log("ERROR", "Little Error", process.ppid);

app.use(marc.express());
app.get("/", (req, res) => {
  res.send("essa");
});

app.listen(3000);
