const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    level: { type: Number, enum: [0, 1, 2], required: true, default: 0 }, // needs to be set manually or can be approved by a level 2 admin
    alerts: { type: Number, enum: [0, 1, 2], default: 0 }, //0 no mails, 1 critical, 2 all
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("Admin", userSchema);
