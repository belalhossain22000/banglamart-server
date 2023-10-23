const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();

module.exports = (cartCollection) => {
  // Route to add an item to the cart or increase quantity if it already exists
  router.post("/addCart", async (req, res) => {
    const cartItem = req.body;
    const productId = cartItem.productId; // Assuming you have a productId field in the cartItem

    try {
      // Check if a cart item with the same product ID exists
      const existingCartItem = await cartCollection.findOne({
        productId: productId,
      });

      if (existingCartItem) {
        // If the product exists, update the quantity
        const updatedQuantity = parseInt(existingCartItem.quantity) + 1;
        if (!isNaN(parseInt(updatedQuantity))) {
          const result = await cartCollection.updateOne(
            { productId: productId },
            { $set: { quantity: updatedQuantity } }
          );
          res
            .status(200)
            .json({ result, message: "Quantity increased successfully" });
        } else {
          res.status(400).json({ message: "Invalid product quantity" });
        }
      } else {
        // If the product doesn't exist, insert a new cart item
        const result = await cartCollection.insertOne(cartItem);
        res
          .status(201)
          .json({ result, message: "Item added to the cart successfully" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Route to get all items in the cart
  router.get("/getCart", async (req, res) => {
    try {
      const cartItems = await cartCollection.find({}).toArray();

      if (!cartItems || cartItems.length === 0) {
        return res.status(404).json({ message: "Cart is empty" });
      }

      res.status(200).json(cartItems);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Route to get cart items by user's email
  router.get("/getByEmail/:userEmail", async (req, res) => {
    const userEmail = req.params.userEmail;

    try {
      // Find cart items with the specified user's email
      const cartItems = await cartCollection
        .find({ userEmail: userEmail })
        .toArray();

      if (!cartItems || cartItems.length === 0) {
        return res.status(404).json({
          message: `No cart items found for user with email ${userEmail}`,
        });
      }

      res.status(200).json(cartItems);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Route to remove an item from the cart by its ID
  router.delete("/remove/:itemId", async (req, res) => {
    const itemId = req.params.itemId;

    try {
      const filter = { _id: new ObjectId(itemId) };

      const result = await cartCollection.deleteOne(filter);

      if (result.deletedCount > 0) {
        res.status(200).json({
          result,
          message: `Item with ID ${itemId} removed from the cart`,
        });
      } else {
        res
          .status(404)
          .json({ message: `Item with ID ${itemId} not found in the cart` });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Route to remove items from the cart by user's email
  router.delete("/removeByEmail/:userEmail", async (req, res) => {
    const userEmail = req.params.userEmail;

    try {
      const filter = { userEmail: userEmail }; // Replace 'userEmail' with the actual field name that stores the user's email in your cart items

      const result = await cartCollection.deleteMany(filter);

      if (result.deletedCount > 0) {
        res.status(200).json({
          result,
          message: `Items for user with email ${userEmail} removed from the cart`,
        });
      } else {
        res.status(404).json({
          message: `No items found for user with email ${userEmail} in the cart`,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return router;
};
