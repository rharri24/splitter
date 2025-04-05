//for login and register
// will make student after registration is successfull
// so initiallu just user

/**** not used yet  */

import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// **Hash password before saving**
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// **Compare passwords during login**
userSchema.methods.comparePassword = function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

// Create Model
const userModel = mongoose.model("Users", userSchema);

export { userModel };
