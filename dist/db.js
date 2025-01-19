"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tag = exports.Content = exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const config_1 = require("./config");
mongoose_1.default
    .connect(config_1.mongoo_uri)
    .then(() => {
    console.log("db connected");
})
    .catch((err) => console.log(err));
const UserSchema = new mongoose_1.Schema({
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
const ContentSchema = new mongoose_1.Schema({
    title: { type: String, require: true },
    link: { type: String, require: true, unique: true },
    type: { type: String, enum: contentTypes, require: true },
    tag: [{ type: mongoose_1.Types.ObjectId, ref: "tag" }],
    userId: { type: mongoose_1.Types.ObjectId, ref: "User", require: true },
});
//tag schema model
const tagSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true, unique: true },
});
exports.User = mongoose_1.default.model("User", UserSchema);
exports.Content = mongoose_1.default.model("Content", ContentSchema);
exports.Tag = mongoose_1.default.model("Tag", tagSchema);
