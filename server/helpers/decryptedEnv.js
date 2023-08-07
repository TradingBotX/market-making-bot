const _ = require("lodash");
// const { argv } = require("yargs");
// const secret = argv["secret"];
const fs = require("fs");
const path = require("path");

const data = fs.readFileSync(path.resolve(__dirname, "data.json"), "UTF-8");
const secret = JSON.parse(data).secret;

if (_.isEmpty(secret)) process.exit(9);

const { AESDecrypt } = require("./crypto");

/**
 *
 * @param {String} encryptedKey name of field as per .env
 */
const GetDecryptedEnv = (encryptedKey) => {
  const decoded = AESDecrypt(encryptedKey, secret);
  return decoded;
};

exports.GetDecryptedEnv = GetDecryptedEnv;
