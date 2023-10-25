const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();

module.exports = (usersCollection) => {
  // Route to update a user's cart by email
  router.put("/updateUserCart/:userEmail", async (req, res) => {
    const userEmail = req.params.userEmail;
    const updatedCartItem = req.body; // The updated cart item data sent from the client

    try {
      // Fetch the user by their email
      const user = await usersCollection.findOne({ email: userEmail });

      if (!user) {
        return res.status(404).json({
          message: `User with email ${userEmail} not found`,
        });
      }

      const updatedCart = user.cart || []; // Initialize the cart as an array if it's not already
      const existingItemIndex = updatedCart.findIndex(
        (item) => item.productId === updatedCartItem.productId
      );

      if (existingItemIndex !== -1) {
        // If the product already exists in the cart, increase its quantity
        updatedCart[existingItemIndex].quantity += 1;
      } else {
        // If the product is not in the cart, add it to the cart array
        updatedCart.push(updatedCartItem);
      }

      // Update the user's cart with the new cart data
      const filter = { email: userEmail };
      const update = {
        $set: { cart: updatedCart },
      };

      const result = await usersCollection.updateOne(filter, update);

      if (result.modifiedCount > 0) {
        res.status(200).json({
          message: `User with email ${userEmail}'s cart updated successfully`,
          updatedCart: updatedCart,
        });
      } else {
        res.status(500).json({
          message: "Failed to update user's cart",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return router;
};
