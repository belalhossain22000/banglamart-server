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

  router.get("/getUserCart/:userEmail", async (req, res) => {
    const userEmail = req.params.userEmail;

    try {
      // Find the user with the specified email
      const user = await usersCollection.findOne({ email: userEmail });

      if (user) {
        // Return the user's cart from the user object
        const userCart = user.cart || [];

        res.status(200).json(userCart);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Route to increase or decrease quantity of a product in the user's cart
  router.put("/updateCartQuantity/:userEmail", async (req, res) => {
    const userEmail = req.params.userEmail;
    const { productId, change } = req.body;
    console.log(req.body);
    try {
      // Find the user with the specified email
      const user = await usersCollection.findOne({ email: userEmail });

      if (user) {
        // Find the product in the user's cart by its productId
        const cart = user.cart || [];
        const productIndex = cart.findIndex(
          (product) => product.productId === productId
        );

        if (productIndex !== -1) {
          // Product found, update its quantity
          if (change === "increase") {
            cart[productIndex].quantity++;
          } else if (change === "decrease" && cart[productIndex].quantity > 1) {
            cart[productIndex].quantity--;
          }

          // Update the user's cart with the modified cart
          await usersCollection.updateOne(
            { email: userEmail },
            { $set: { cart } }
          );

          res
            .status(200)
            .json({ message: "Cart quantity updated successfully", cart });
        } else {
          res.status(404).json({ message: "Product not found in the cart" });
        }
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return router;
};
