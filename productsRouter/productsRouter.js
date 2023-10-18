const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();

module.exports = (productsCollection) => {

  // Route to create a new product
  router.post("/createProducts", async (req, res) => {
    const product = req.body;
    try {
      const result = await productsCollection.insertOne(product);
      res.status(201).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Route to get all products
  router.get("/getProducts", async (req, res) => {
    try {
      const allProducts = await productsCollection.find({}).toArray();

      if (!allProducts || allProducts.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }

      res.status(200).json(allProducts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Route to get a product by its ID
  router.get("/getProduct/:productId", async (req, res) => {
    const productId = req.params.productId;

    try {
      const product = await productsCollection.findOne({
        _id: new ObjectId(productId),
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });


  // Route to update a product by its ID
router.put("/updateProduct/:productId", async (req, res) => {
  const productId = req.params.productId;
  const updatedProduct = req.body; 

  try {
    const filter = { _id: new ObjectId(productId) };
    const update = {
      $set: updatedProduct, 
    };

    const result = await productsCollection.updateOne(filter, update);

    if (result.matchedCount > 0) {
      res.status(200).json({result, message: `Product with ID ${productId} updated successfully` });
    } else {
      res.status(404).json({ message: `Product with ID ${productId} not found` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to delete a product by its ID
router.delete("/deleteProduct/:productId", async (req, res) => {
  const productId = req.params.productId;

  try {
    const filter = { _id: new ObjectId(productId) };

    const result = await productsCollection.deleteOne(filter);

    if (result.deletedCount > 0) {
      res.status(200).json({result, message: `Product with ID ${productId} deleted successfully` });
    } else {
      res.status(404).json({ message: `Product with ID ${productId} not found` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

  return router;
};
