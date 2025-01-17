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
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
const JWT_SECRET = "your_secret_key"; // Use a secure key in production
// Signup schema
const signupSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(3, "Username must be at least 3 characters long")
        .email("Enter a valid email id"),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});
// Login schema
const loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, "Username is required"),
    password: zod_1.z.string().min(1, "Password is required"),
});
// Signup route
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedBody = signupSchema.parse(req.body);
        const { username, password } = parsedBody;
        const userCheck = yield db_1.User.findOne({ username });
        if (userCheck) {
            res.status(409).json({
                message: "User  already exists",
                success: false,
            });
        }
        const hash = yield bcrypt_1.default.hash(password, 10); // Use async hash
        yield db_1.User.create({
            username,
            password: hash,
        });
        res.status(201).json({ message: "User  registered successfully", success: true });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                message: error.errors.map((e) => e.message).join(", "),
                success: false,
            });
        }
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
}));
// Login route
app.post("/api/v1/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedBody = loginSchema.parse(req.body);
        const { username, password } = parsedBody;
        const user = yield db_1.User.findOne({ username });
        if (user) {
            const passwordCheck = yield bcrypt_1.default.compare(password, user.password);
            if (!passwordCheck) {
                res.status(401).json({
                    message: "Invalid password",
                    success: false,
                });
            }
            const token = jsonwebtoken_1.default.sign({ db_id: user._id }, JWT_SECRET, {
                expiresIn: "24h",
            });
            res.status(200).json({
                message: "User  logged in successfully",
                success: true,
                token: token,
                loggedUser: user,
            });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
