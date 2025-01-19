import { JWT_SECRET, PORT } from "./config";
import express, { Request, Response } from "express";
import { User, Content, Tag } from "./db";
import bcrypt from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { userMiddleware } from "./middleware";
import { log } from "console";

const app = express();
app.use(express.json());

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
app.post("/api/v1/signup", async (req, res) => {
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

    res
      .status(201)
      .json({ message: "User  registered successfully", success: true });
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
app.post("/api/v1/login", async (req, res) => {
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

      const token = jwt.sign({ db_id: user._id }, JWT_SECRET as string, {
        expiresIn: "24h",
      });

      res.status(200).json({
        message: "User  logged in successfully",
        success: true,
        token: token,
        loggedUser: user,
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

app.post("/api/v1/content/add", userMiddleware, async (req, res) => {
  const title = req.body.title;
  const link = req.body.link;

  Content.create({
    title,
    link,
    userId: req.userId,
    tag: [],
  });

  res.status(200).json({
    message: "Data saved",
    success: true,
  });
});

app.get("/api/v1/content/", userMiddleware, async (req, res) => {
  try {
    // Fetch the user data based on the userId
    const userData = await Content.find({ userId: req.userId });

    // Log the data (optional for debugging purposes)
    console.log(userData);

    // Send the response with the fetched data
    res.status(200).json({
      message: "User data downloaded",
      success: true,
      data: userData, // Sending the user data in the response
    });
  } catch (error) {
    console.error("Error fetching user data:", error);

    // Handle any errors during the database query
    res.status(500).json({
      message: "Failed to fetch user data",
      success: false,
      error,
    });
  }
});

app.delete(
  "/api/v1/content/delete/:contentId",
  userMiddleware,
  async (req, res) => {
    try {
      const loggedUser = req.userId; // User ID from the middleware
      const contentId = req.params.contentId; // Extract contentId from URL parameter

      // Find the content by ID
      const content = await Content.findById(contentId);

      // Check if the content exists
      if (!content) {
        res.status(404).json({
          message: "Content not found",
          success: false,
        });
      }

      // Optionally, you can check if the logged user is the owner of the content
      if (content?.userId !== loggedUser) {
        res.status(403).json({
          message: "You do not have permission to delete this content",
          success: false,
        });
      }

      // Delete the content
      await Content.findByIdAndDelete(contentId);

      // Send success response
      res.status(200).json({
        message: "Content deleted successfully",
        success: true,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Error deleting content",
        success: false,
        err,
      });
    }
  }
);

const port = PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${port}`);
});
