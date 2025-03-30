const mongoose = require("mongoose");

const ItemPriceSchema = new mongoose.Schema({
    currency: { type: String, default: "INR" },
    listingPrice: Number,
    mrp: Number,
    msp: Number,
    netSellerPayable: Number
});

const VariantSchema = new mongoose.Schema({
    imageUrl: String,
    productUrl: String,
    variantId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    sku: { type: String, required: true },
    size: String,
    color: String,
    live: { type: Boolean, default: true },
    productDescription: String,
    itemPrice: ItemPriceSchema,
    inventory: Number,
    blockedInventory: Number,
    pendency: Number
});

const ProductSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // 👈 Add sellerId
    parentTitle: { type: String, required: true },
    brand: { type: String, required: true },
    variants: { type: [VariantSchema], required: true },
    commissionPercentage: Number,
    paymentGatewayCharge: Number,
    logisticsCost: Number,
    additionalInfo: String,
    created: { type: Date, default: Date.now }
});

const Product = mongoose.model("products", ProductSchema);
module.exports = Product;
