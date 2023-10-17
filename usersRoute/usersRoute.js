const express = require("express");
const router = express.Router();

module.exports = (usersCollection) => {
  // get all users
  router.get("/users", async (req, res) => {
    try {
      const allUsers = await usersCollection.find({}).toArray();

      if (!allUsers || allUsers.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }

      res.status(200).json(allUsers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  //  get a user by their email
  router.get("/users/:email", async (req, res) => {
    const userEmail = req.params.email;

    try {
      const user = await usersCollection.findOne({ email: userEmail });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });


  // create user
  router.post("/users", async (req, res) => {
    const user = req.body;
    const query = { email: user.email };
    // console.log(user);
    const existingUser = await usersCollection.findOne(query);
    if (existingUser) {
      return res.send({ message: "User already exists" });
    }
    // console.log(existingUser);

    const result = await usersCollection.insertOne(user);
    res.send(result);
  });

  return router;
};
