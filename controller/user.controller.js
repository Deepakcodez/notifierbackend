const bcrypt = require("bcrypt");
const { User } = require("../model/user.model");
const jwt = require("jsonwebtoken");

const demo = async (req, res) => {
  res.send("hello");
};

const register = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validate input
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required." });
      }
  
      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(409).json({ error: "User already exists." });
      }
  
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Save user to the "database"
      const newUser = await User.create({ email, password: hashedPassword });
  
      // Generate a JWT token for automatic login
      const payload = {
        id: newUser._id,
        email: newUser.email,
      };
      const secretKey = "your_secret_key";
      const token = jwt.sign(payload, secretKey, { expiresIn: "7d" });
  
      return res.status(201).json({
        message: "User registered successfully and logged in!",
        token,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };
  

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // Check if user already exists (Replace this with your DB query)
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(400).json({ error: "User not avaialble" });
    }

    const isMatch = await bcrypt.compare(String(password), User.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Wrong Password" });
    }

    // Generate a JWT token
    const payload = {
      id: userExists._id,
      email: userExists.email,
    };

    const secretKey = "your_secret_key";
    const token = jwt.sign(payload, secretKey, { expiresIn: "7d" });

    return res.status(200).json({
      message: "Login successful!",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { demo, register , login};
