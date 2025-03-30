const mongoose = require("mongoose");

const orderItemPriceSchema = new mongoose.Schema({
    cashOnDeliveryCharges: { type: Number },
    sellingPrice: { type: Number, required: true },
    shippingCharges: { type: Number },
    discount: { type: Number },
    totalPrice: { type: Number, required: true },
    transferPrice: { type: Number },
    currency: { type: String, default: "INR" },
});

const orderItemSchema = new mongoose.Schema({
    orderItemId: { type: String, required: true, unique: true },
    status: {
        type: String,
        required: true,
        enum: ["CANCELLED", "CREATED", "DISPATCHED", "DELIVERED"]
    },
    productId: { type: String, required: true },
    variantId: { type: String, required: true },
    sku: { type: String, required: true },
    title: { type: String, required: true },
    shippingMethodCode: { type: String, enum: ["STD"] },
    orderItemPrice: { type: orderItemPriceSchema, required: true },
    quantity: { type: Number, required: true, default: 1 },
    giftWrap: {
        giftWrapMessage: { type: String },
        giftWrapCharges: { type: Number },
    },
    onHold: { type: Boolean, default: false },
    packetNumber: { type: Number, default: 1 },
    facilityCode: { type: String },
});

const addressSchema = new mongoose.Schema({
    addressLine1: { type: String, required: true, maxlength: 100 },
    addressLine2: { type: String, maxlength: 100 },
    city: { type: String, required: true },
    country: { type: String, required: true },
    email: { type: String, lowercase: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    pincode: { type: String, required: true },
    state: { type: String, required: true },
});

const orderPriceSchema = new mongoose.Schema({
    currency: { type: String, default: "INR" },
    totalCashOnDeliveryCharges: { type: Number },
    totalDiscount: { type: Number },
    totalGiftCharges: { type: Number },
    totalStoreCredit: { type: Number },
    totalPrepaidAmount: { type: Number },
    totalShippingCharges: { type: Number },
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    displayOrderNumber: { type: String }, // If not provided, use orderId
    orderDate: { type: Date, required: true },
    orderStatus: {
        type: String,
        required: true,
        enum: ["PENDING_VERIFICATION", "CREATED", "CANCELLED", "RETURNED"]
    },
    sla: { type: Date, required: true },
    priority: { type: Number, default: 0 },
    paymentType: { type: String, enum: ["COD", "PREPAID"] },
    orderPrice: { type: orderPriceSchema },
    orderItems: { type: [orderItemSchema], required: true },
    taxExempted: { type: Boolean, default: false },
    cFormProvided: { type: Boolean, default: false },
    thirdPartyShipping: { type: Boolean, required: true },
    shippingAddress: { type: addressSchema, required: true },
    billingAddress: { type: addressSchema, required: true },
    gstin: { type: String },
    additionalInfo: { type: String },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order