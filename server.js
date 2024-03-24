const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid"); // Import uuid
const { User, Policy } = require("./models/productmodel");
const swaggerAutogen = require("swagger-autogen");
const app = express();
const PORT = process.env.PORT || 9000; // Changed port to 9000
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

mongoose
  .connect(
    "mongodb+srv://ravi:ravi123@cluster0.1egcrvd.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

function generateToken(user, secretKey) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    secretKey,
    {
      expiresIn: "1h", // Token expiry time
    }
  );
}

app.post("/loginpolicyholder", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const secretKey = uuidv4(); // Generate unique secret key
    const token = generateToken(user, secretKey);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  const secretKey = req.headers["secret-key"];
  if (!token || !secretKey) {
    return res
      .status(403)
      .json({ message: "Token or secret key not provided" });
  }
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
}

app.get("/policies/:id", verifyToken, async (req, res) => {
  try {
    // Your route logic here
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/policyholder", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Create a new user (policyholder)
    const newUser = await User.create({ name, email, password });
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating policyholder:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to update a policyholder
app.put("/policyholder/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: `Cannot find policyholder with ID ${id}` });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to delete a policyholder
app.delete("/policyholder/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res
        .status(404)
        .json({ message: `Cannot find policyholder with ID ${id}` });
    }
    res.status(200).json({ message: "Policyholder deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to update a policy
app.put("/policies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPolicy = await Policy.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedPolicy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    res.status(200).json(updatedPolicy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to delete a policy
app.delete("/policies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPolicy = await Policy.findByIdAndDelete(id);
    if (!deletedPolicy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    res.status(200).json({ message: "Policy deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get all policies
app.get("/policies", async (req, res) => {
  try {
    const policies = await Policy.find();
    res.status(200).json(policies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to create a new policyholder's policy
app.post("/policyholder/:id/policies", async (req, res) => {
  try {
    const { id } = req.params;
    const policyholder = await User.findById(id);
    if (!policyholder) {
      return res.status(404).json({ message: "Policyholder not found" });
    }
    const { policy, amount, status } = req.body;
    const newPolicy = await Policy.create({ policy, amount, status });
    policyholder.policies.push(newPolicy);
    await policyholder.save();
    res.status(201).json(newPolicy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
