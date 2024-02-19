const express = require("express");
const mongoose = require("mongoose");
var cors = require("cors");
const { User, Policy } = require("./models/productmodel");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

// Connect to MongoDB
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

// Routes

// Hello World route
app.get("/", (req, res) => {
  res.send("Hello Node API");
});

// Create a new policy holder
app.post("/policyholder", async (req, res) => {
  try {
    const policyholder = await User.create(req.body);
    res.status(201).json(policyholder);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error.message);
  }
});

app.post("/loginpolicyholder", async (req, res) => {
  try {
    console.log("hi");
    console.log(req.body);
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(user);
    return res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error.message);
  }
});

// Update a policy holder
app.put("/policyholder/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const policyholder = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!policyholder) {
      return res
        .status(404)
        .json({ message: `Cannot find policyholder with ID ${id}` });
    }
    res.status(200).json(policyholder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a policy holder
app.delete("/policyholder/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const policyholder = await Policy.findByIdAndDelete(id);
    if (!policyholder) {
      return res
        .status(404)
        .json({ message: `Cannot find policyholder with ID ${id}` });
    }
    res.status(200).json({ message: "Policyholder deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all policies
app.get("/policies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const policies = await Policy.find({ id });
    console.log(policies);
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a policy by ID
app.get("/policies/:id", async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// create a policy
app.post("/createpolicy", async (req, res) => {
  console.log("hi");
  try {
    // Assuming you have a JSON body with policy details in the request
    const { id, policy, amount, status } = req.body;

    console.log({
      id,
      policy,
      amount: parseInt(amount),
      status,
    });
    const savedPolicy = await Policy.create({
      id,
      policy,
      amount: parseInt(amount),
      status,
    });
    console.log(savedPolicy);
    res.status(201).json(savedPolicy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a policy by ID
app.put("/policies/:id", async (req, res) => {
  try {
    delete req.body._id;
    const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a policy by ID
app.delete("/policy/:id", async (req, res) => {
  try {
    const policy = await Policy.findByIdAndDelete(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    res.json({ message: "Policy deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
