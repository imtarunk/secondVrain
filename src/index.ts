import express, { Request, Response } from "express";
import { UserModel } from "./db";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import z, { promise, string } from "zod";
import jwt from "jsonwebtoken";

const app = express();
const port = 3000;
app.use(express.json());

const JWT_SECRET = "your_secret_key"; // Use a secure key in production

const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .email("Entre a valid email id"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter") // Password must have at least one uppercase letter
    .regex(/[0-9]/, "Password must contain at least one number"), // Password must have at least one number,
});

app.post("/api/v1/signup", async (req, res) => {
  try {
    const parsedBody = signupSchema.parse(req.body);
    const { username, password } = parsedBody;

    if (!username || !password) {
      res.status(400).json({
        message: "Entre a valid input",
      });
    }

    const userCheck = await UserModel.findOne({ username });

    if (userCheck) {
      res.status(209).json({
        message: "user allready exist",
        success: true,
        userCheck,
      });
    }

    const hash = bcrypt.hashSync(password, 5);

    await UserModel.create({
      username,
      password: hash,
    });

    res
      .status(201)
      .json({ message: "User registered successfully", success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
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
});

// app.post("/api/v1/login", async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({
//         message: "Entre a valid input",
//       });
//     }

//     try {
//       const user = await UserModel.findOne({ username });

//       if (!user) {
//         return res.status(411).json({
//           message: "user not found",
//           success: true,
//         });
//       }
//       const passwordCheck = bcrypt.compareSync(password, user?.password);

//       if (!passwordCheck) {
//         return res.status(401).json({
//           message: "Invalid password",
//           success: false,
//         });
//       }

//       const token = jwt.sign({ db_id: user._id }, JWT_SECRET, {
//         expiresIn: "24h",
//       });

//       return res.status(200).json({
//         message: "user login successfully ",
//         success: true,
//         token: token,
//         loggedUser: user,
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({
//         message: "Internal server error",
//         success: false,
//       });
//     }
//   } catch (error) {
//     console.log(error);
//   }
// });

app.post("/api/v1/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        message: "Entre a valid input",
      });
    }

    try {
      const user = await UserModel.findOne({ username });

      if (!user) {
        res.status(411).json({
          message: "user not found",
          success: true,
        });
      }
      const passwordCheck = bcrypt.compareSync(user?.password, password);

      if (!passwordCheck) {
        res.status(401).json({
          message: "Invalid password",
          success: false,
        });
      }

      const token = jwt.sign({ db_id: user?._id }, JWT_SECRET, {
        expiresIn: "24h",
      });

      return res.status(200).json({
        message: "user login successfully ",
        success: true,
        token: token,
        loggedUser: user,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});
app.listen(3000, () => {
  console.log(`Server is running on ${port}`);
});
