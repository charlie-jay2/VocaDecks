const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email and password are required" });
    }
    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(409).json({ message: "User with this email already exists" });
        }
        // Create the user (password gets hashed by pre-save hook)
        user = new User({ username, email, password, firstName, lastName });
        await user.save();

        // Optionally, generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(201).json({ message: "User registered successfully", token, user });
    } catch (error) {
        console.error("Signup error", error);
        return res.status(500).json({ message: "Server error during signup" });
    }

    exports.login = async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required" });
        }
        try {
          const user = await User.findOne({ email });
          if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
          }
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
          return res.status(200).json({ message: "Login successful", token, user });
        } catch (error) {
          console.error("Login error", error);
          return res.status(500).json({ message: "Server error during login" });
        }
      };

      exports.updateProfile = async (req, res) => {
        // Assume req.user is set by authentication middleware
        const updateData = req.body;
        try {
          const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });
          return res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
        } catch (error) {
          console.error("Update profile error", error);
          return res.status(500).json({ message: "Server error during profile update" });
        }
      };

      
      exports.deleteAccount = async (req, res) => {
        try {
          await User.findByIdAndDelete(req.user.id);
          return res.status(200).json({ message: "Account deleted successfully" });
        } catch (error) {
          console.error("Delete account error", error);
          return res.status(500).json({ message: "Server error during account deletion" });
        }
      };

      
      


};