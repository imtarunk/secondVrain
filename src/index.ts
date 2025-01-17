import express, { Request, Response } from "express";
import { User } from "./db";
import bcrypt from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken";

const app = express();
const port = 3000;
app.use(express.json());

const JWT_SECRET = "your_secret_key"; // Use a secure key in production

// Signup schema
const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .email("Enter a valid email id"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Signup route
app.post("/api/v1/signup", async (req,res) => {
  try {
    const parsedBody = signupSchema.parse(req.body);
    const { username, password } = parsedBody;

    const userCheck = await User.findOne({ username });
    if (userCheck) {
       res.status(409).json({
        message: "User  already exists",
        success: false,
      });
    }

    const hash = await bcrypt.hash(password, 10); // Use async hash
    await User.create({
      username,
      password: hash,
    });

     res.status(201).json({ message: "User  registered successfully", success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
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
});

// Login route
app.post("/api/v1/login", async (req,res) => {
  try {
    const parsedBody = loginSchema.parse(req.body);
    const { username, password } = parsedBody;

    const user = await User.findOne({ username });

    if (user) {
      const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
       res.status(401).json({
        message: "Invalid password",
        success: false,
      });
    }

    const token = jwt.sign({ db_id:user._id }, JWT_SECRET, {
      expiresIn: "24h",
    });

     res.status(200).json({
      message: "User  logged in successfully",
      success: true,
      token: token,
      loggedUser:  user,
    });
    }

    
  } catch (error) {
    console.error(error);
     res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});