import mongoose, { model, Schema } from "mongoose";

mongoose
  .connect(
    "mongodb+srv://tarunshr145:mLLcZqxH5Ch1tWZx@cluster0.dt9ca.mongodb.net/"
  )
  .then(() => {
    console.log("db connected");
  })
  .catch((err) => console.log(err));

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: [true, "Username is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
  },
});

export const UserModel = model("User", UserSchema);
