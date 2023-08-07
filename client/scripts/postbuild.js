const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");

const buildFolder = "serving-build";
const source = "build";

const buildFolderPath = path.join(__dirname, "../", buildFolder);
const sourcePath = path.join(__dirname, "../", source);

fse.ensureDirSync(buildFolderPath);

fse.emptyDirSync(buildFolderPath);

fse
  .copy(sourcePath, buildFolderPath)
  .then(console.log(">>>> successfully builed the code"))
  .catch((err) => {
    console.log("error in post-build script", err);
    process.exit(1);
  });
