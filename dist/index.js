"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = __importDefault(require("zod"));
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
const signupSchema = zod_1.default.object({
    username: zod_1.default
        .string()
        .min(3, "Username must be at least 3 characters long")
        .email("Entre a valid email id"),
    password: zod_1.default
        .string()
        .min(6, "Password must be at least 6 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter") // Password must have at least one uppercase letter
        .regex(/[0-9]/, "Password must contain at least one number"), // Password must have at least one number,
});
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedBody = signupSchema.parse(req.body);
        const { username, password } = parsedBody;
        if (!username || !password) {
            res.status(400).json({
                message: "Entre a valid input",
            });
        }
        const userCheck = yield db_1.UserModel.findOne({ username });
        if (userCheck) {
            res.status(209).json({
                message: "user allready exist",
                success: true,
                userCheck,
            });
        }
        const hash = bcrypt_1.default.hashSync(password, 5);
        yield db_1.UserModel.create({
            username,
            password: hash,
        });
        res
            .status(201)
            .json({ message: "User registered successfully", success: true });
    }
    catch (error) {
        if (error instanceof zod_1.default.ZodError) {
            res.status(400).json({
                message: error.errors.map((e) => e.message).join(", "),
                success: false,
            });
        }
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
}));
app.post("/api/v1/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({
            message: "Entre a valid input",
        });
    }
    const user = yield db_1.UserModel.findOne({ username });
    console.log(username.password);
    // const userVerify = bcrypt.compareSync(password);
}));
app.listen(3000, () => {
    console.log(`Server is running on ${port}`);
});
