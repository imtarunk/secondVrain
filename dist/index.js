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
const config_1 = require("./config");
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middleware_1 = require("./middleware");
const app = (0, express_1.default)();
app.use(express_1.default.json());
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
        res
            .status(201)
            .json({ message: "User  registered successfully", success: true });
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
            const token = jsonwebtoken_1.default.sign({ db_id: user._id }, config_1.JWT_SECRET, {
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
app.post("/api/v1/content/add", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const title = req.body.title;
    const link = req.body.link;
    db_1.Content.create({
        title,
        link,
        userId: req.userId,
        tag: [],
    });
    res.status(200).json({
        message: "Data saved",
        success: true,
    });
}));
app.get("/api/v1/content/", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch the user data based on the userId
        const userData = yield db_1.Content.find({ userId: req.userId });
        // Log the data (optional for debugging purposes)
        console.log(userData);
        // Send the response with the fetched data
        res.status(200).json({
            message: "User data downloaded",
            success: true,
            data: userData, // Sending the user data in the response
        });
    }
    catch (error) {
        console.error("Error fetching user data:", error);
        // Handle any errors during the database query
        res.status(500).json({
            message: "Failed to fetch user data",
            success: false,
            error,
        });
    }
}));
app.delete("/api/v1/content/delete/:contentId", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loggedUser = req.userId; // User ID from the middleware
        const contentId = req.params.contentId; // Extract contentId from URL parameter
        // Find the content by ID
        const content = yield db_1.Content.findById(contentId);
        // Check if the content exists
        if (!content) {
            res.status(404).json({
                message: "Content not found",
                success: false,
            });
        }
        // Optionally, you can check if the logged user is the owner of the content
        if ((content === null || content === void 0 ? void 0 : content.userId) !== loggedUser) {
            res.status(403).json({
                message: "You do not have permission to delete this content",
                success: false,
            });
        }
        // Delete the content
        yield db_1.Content.findByIdAndDelete(contentId);
        // Send success response
        res.status(200).json({
            message: "Content deleted successfully",
            success: true,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error deleting content",
            success: false,
            err,
        });
    }
}));
const port = config_1.PORT || 3000;
app.listen(config_1.PORT, () => {
    console.log(`Server is running on port ${port}`);
});
