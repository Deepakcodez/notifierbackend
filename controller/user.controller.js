const bcrypt = require("bcrypt");
const { User } = require("../model/user.model");
const jwt = require("jsonwebtoken");
const secretKey = "secret_key"; 

const demo = async (req, res) => {
  res.send("hello");
};

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
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
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate a JWT token for automatic login
    const payload = {
      name: newUser.name,
      id: newUser._id,
      email: newUser.email,
    };
   
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

    const isMatch = await bcrypt.compare(password, userExists.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Wrong Password" });
    }

    // Generate a JWT token
    const payload = {
      id: userExists._id,
      email: userExists.email,
    };

   
    const token = jwt.sign(payload, secretKey, { expiresIn: "7d" });

    return res.status(201).json({
      message: "Login successful!",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
};




const getCurrentUser = (req, res) => {
  try {
   
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

  
    const decoded = jwt.verify(token, secretKey);


    console.log("Decoded token:", decoded);

    // Return user data based on the decoded token
    const user = { id: decoded.id, email: decoded.email, name: decoded.name }; 
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error decoding token:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};


const getAllUsers = async (req, res) => {
  try {

    const users = await User.find({}, { password: 0 }); 

    // Return the users
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
};



module.exports = { demo, register, login ,getCurrentUser, getAllUsers};
