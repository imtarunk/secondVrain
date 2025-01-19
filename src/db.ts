import mongoose, { model, Schema, Types } from "mongoose";
import { object, string } from "zod";
import { mongoo_uri } from "./config";

mongoose
  .connect(mongoo_uri as string)
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

const contentTypes = ["image", "video", "article", "audio"];

// content schema model
const ContentSchema = new Schema({
  title: { type: String, require: true },
  link: { type: String, require: true, unique: true },
  type: { type: String, enum: contentTypes, require: true },
  tag: [{ type: Types.ObjectId, ref: "tag" }],
  userId: { type: Types.ObjectId, ref: "User", require: true },
});

//tag schema model
const tagSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
});

export const User = mongoose.model("User", UserSchema);
export const Content = mongoose.model("Content", ContentSchema);
export const Tag = mongoose.model("Tag", tagSchema);
