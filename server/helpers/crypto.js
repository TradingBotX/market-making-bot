const crypto = require("crypto");
const algorithm = "aes256";

/**
 *
 * @param {string} text
 * @param {string} encryptionKey
 */
const encrypt = function (text, encryptionKey) {
  try {
    let iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv(
      algorithm,
      Buffer.from(encryptionKey),
      iv
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (error) {
    console.log("encrypt_error", error);
    return "error";
  }
};

/**
 *
 * @param {string} encrypted
 * @param {string} encryptionKey
 */
const decrypt = function (encrypted, encryptionKey) {
  try {
    let textParts = encrypted.split(":");
    let iv = Buffer.from(textParts.shift(), "hex");
    let encryptedText = Buffer.from(textParts.join(":"), "hex");
    let decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(encryptionKey),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.log("decrypt_error", error);
    return "error";
  }
};

exports.AESEncrypt = encrypt;
exports.AESDecrypt = decrypt;
