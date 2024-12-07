const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const userSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: [true, "please enter name"],
    },
    email: {
      type: String,
      required: [true, "please enter email"],
      unique: [true, "email already exist"],
      
    },
    password: {
      type: String,
      minlength: [6, "password must be  at least 6 characters"],
      required: [true, "please enter password"],
    },
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);
module.exports = { User };
