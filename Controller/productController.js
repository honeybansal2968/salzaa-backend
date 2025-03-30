const Product = require("../Schema/product"); // Mongoose model
const mongoose = require("mongoose");
// GET /products - Fetch live products
exports.getProducts = async (req, res) => {
    try {
        // 🛑 Ensure seller is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, code: 401, message: "Seller not authenticated" });
        }

        const sellerId = req.user._id; // Extract sellerId from authenticated user
        const { pageNumber = 1, pageSize = 50, skus, publishedStatus } = req.query;

        // Convert pageNumber and pageSize to numbers
        const page = parseInt(pageNumber);
        const limit = parseInt(pageSize);

        // 🛑 Validate publishedStatus
        if (publishedStatus !== "PUBLISHED") {
            return res.status(400).json({ success: false, code: 400, message: "Invalid publishedStatus" });
        }

        // ✅ Create base filter (only live variants and seller's products)
        let matchFilter = { sellerId, "variants.live": true };

        // ✅ Filter by SKU if provided
        if (skus) {
            matchFilter["variants.sku"] = skus;
        }

        // ✅ Use aggregation to filter only relevant variants
        const products = await Product.aggregate([
            { $match: matchFilter },
            {
                $addFields: {
                    variants: {
                        $filter: {
                            input: "$variants",
                            as: "variant",
                            cond: { $eq: ["$$variant.live", true] }
                        }
                    }
                }
            },
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ]);

        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, code: 500, message: "Internal Server Error" });
    }
};

exports.createProduct = async (req, res) => {
    try {
        // 🛑 Ensure seller is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, error: "Seller not authenticated" });
        }

        const sellerId = req.user._id; // 👈 Extract sellerId from authenticated user

        const {
            parentTitle,
            brand,
            variants,
            commissionPercentage,
            paymentGatewayCharge,
            logisticsCost,
            additionalInfo
        } = req.body;

        // 🛑 Validate required fields
        if (!parentTitle || !brand || !variants || variants.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields",
                missingFields: {
                    parentTitle: !!parentTitle,
                    brand: !!brand,
                    variants: variants && variants.length > 0
                }
            });
        }

        // ✅ Extract all variantIds from request
        const variantIds = variants.map(v => v.variantId);

        // 🛑 Check for duplicate `variantId`s within the payload itself
        const duplicateVariantIds = variantIds.filter((id, index) => variantIds.indexOf(id) !== index);

        if (duplicateVariantIds.length > 0) {
            return res.status(400).json({
                success: false,
                error: "Duplicate variantId found within request payload",
                duplicateVariantIds: [...new Set(duplicateVariantIds)] // Remove duplicates from the list
            });
        }

        // 🛑 Check if any of these `variantId`s already exist in the database
        const existingVariants = await Product.findOne({ "variants.variantId": { $in: variantIds } });

        if (existingVariants) {
            const duplicateVariant = existingVariants.variants.find(v => variantIds.includes(v.variantId));
            return res.status(400).json({
                success: false,
                error: "Duplicate variantId found in database",
                duplicateVariantId: duplicateVariant.variantId
            });
        }

        // ✅ Create product with sellerId
        const newProduct = new Product({
            sellerId, // 👈 Include sellerId
            parentTitle,
            brand,
            variants,
            commissionPercentage,
            paymentGatewayCharge,
            logisticsCost,
            additionalInfo
        });

        // ✅ Save product
        const savedProduct = await newProduct.save();
        res.status(201).json({ success: true, product: savedProduct });

    } catch (error) {
        console.error("Error creating product:", error);

        // 🛑 Handle MongoDB duplicate key error (E11000)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: "Duplicate product ID",
                duplicateKey: error.keyValue
            });
        }

        // 🛑 Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                error: "Validation error",
                details: Object.values(error.errors).map(err => err.message)
            });
        }

        // 🛑 Handle other MongoDB errors
        if (error.name === "MongoServerError") {
            return res.status(500).json({
                success: false,
                error: "Database error",
                details: error.message
            });
        }

        // 🔴 Default server error
        res.status(500).json({
            success: false,
            error: "Internal server error",
            details: error.message
        });
    }
};

exports.updateInventory = async (req, res) => {
    try {
        const { inventoryList } = req.body;

        // 🛑 Validate request payload
        if (!inventoryList || !Array.isArray(inventoryList) || inventoryList.length === 0) {
            return res.status(400).json({
                status: "FAILED",
                message: "Invalid or missing inventoryList"
            });
        }

        let failedProductList = [];

        // ✅ Process each inventory update request
        for (const item of inventoryList) {
            const { productId, variantId, inventory, hsnCode, facilityCode } = item;

            // 🛑 Validate mandatory fields
            if (!productId || !variantId || !inventory) {
                failedProductList.push({ productId, variantId, message: "Missing required fields" });
                continue;
            }

            // ✅ Find the product and update inventory
            const product = await Product.findOne({ _id: productId, "variants.variantId": variantId });

            if (!product) {
                failedProductList.push({ productId, variantId, message: "Product or variant not found" });
                continue;
            }

            // ✅ Update inventory in the correct variant
            const updatedProduct = await Product.updateOne(
                { _id: productId, "variants.variantId": variantId },
                { $set: { "variants.$.inventory": inventory } }
            );

            if (updatedProduct.modifiedCount === 0) {
                failedProductList.push({ productId, variantId, message: "Inventory update failed" });
            }
        }

        // ✅ Determine response status
        const status = failedProductList.length === 0 ? "SUCCESS" :
            failedProductList.length === inventoryList.length ? "FAILED" :
                "PARTIAL_SUCCESS";

        res.status(200).json({ status, failedProductList });

    } catch (error) {
        console.error("Error updating inventory:", error);
        res.status(500).json({ status: "FAILED", message: "Internal Server Error" });
    }
};

exports.productsCount = async (req, res) => {
    try {
        const { publishedStatus } = req.query;

        // Validate query parameters
        if (!publishedStatus || publishedStatus !== "PUBLISHED") {
            return res.status(400).json({ message: "Invalid publishedStatus" });
        }

        // Get the seller ID from the authenticated user (assuming auth middleware attaches `req.user.id`)
        const sellerId = new mongoose.Types.ObjectId(req.user.id);

        // Count published products belonging to the seller
        const count = await Product.aggregate([
            { $match: { sellerId: sellerId, "variants.live": true } }, // Filter by sellerId
            { $unwind: "$variants" }, // Unwind to count each variant separately
            { $match: { "variants.live": true } }, // Ensure variant is live
            { $count: "count" }
        ]);

        // Extract count value or return 0 if no products found
        const totalCount = count.length > 0 ? count[0].count : 0;

        res.status(200).json({ count: totalCount });
    } catch (error) {
        console.error("Error fetching product count:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
