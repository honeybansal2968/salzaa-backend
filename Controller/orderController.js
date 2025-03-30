const Order = require("../Schema/order");
const axios = require("axios");
const User = require("../Schema/user"); // Import User model
// Uniware API details
const UNIWARE_API_URL = "https://genericproxy.unicommerce.com/uc/v1/order/cancel";
const mongoose = require("mongoose"); // Add this at the top
exports.createOrderByUser = async (req, res) => {
    try {
        const {
            displayOrderNumber,
            orderDate,
            orderStatus,
            sla,
            priority,
            paymentType,
            orderItems,
            thirdPartyShipping,
            shippingAddress,
            billingAddress,
            gstin,
            additionalInfo,
        } = req.body;

        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, error: "User not authenticated" });
        }

        const userId = req.user._id; // 👈 Extract userId

        if (!orderDate || !orderStatus || !sla || !orderItems.length || !shippingAddress || !billingAddress) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields",
                missingFields: {
                    orderDate: !!orderDate,
                    orderStatus: !!orderStatus,
                    sla: !!sla,
                    orderItems: orderItems.length > 0,
                    shippingAddress: !!shippingAddress,
                    billingAddress: !!billingAddress
                }
            });
        }

        const newOrder = new Order({
            userId, // 👈 Save userId
            displayOrderNumber: displayOrderNumber || undefined,
            orderDate,
            orderStatus,
            sla,
            priority: priority || 0,
            paymentType,
            orderItems,
            thirdPartyShipping,
            shippingAddress,
            billingAddress,
            gstin,
            additionalInfo,
        });

        const savedOrder = await newOrder.save();
        res.status(201).json({ success: true, order: savedOrder });

    } catch (error) {
        console.error("Error creating order:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: "Duplicate order item ID",
                duplicateKey: error.keyValue
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                error: "Validation error",
                details: Object.values(error.errors).map(err => err.message)
            });
        }

        if (error.name === "MongoServerError") {
            return res.status(500).json({
                success: false,
                error: "Database error",
                details: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Internal server error",
            details: error.message
        });
    }
};
exports.forwardOrderToUnicommerce = async (req, res) => {
    // Unicommerce API credentials (Replace these with actual credentials)
    const UNICOMMERCE_API_URL = "https://jsonplaceholder.typicode.com/posts"; // Replace with actual UC API when available
    const CLIENT_ID = "test-client-id";
    const MERCHANT_ID = "test-seller";
    const SECURITY_KEY = "test-security-key";
    try {
        let orderData = { ...req.body };

        // Remove unwanted fields
        delete orderData.createdAt;
        delete orderData.updatedAt;
        delete orderData.__v;

        // Set headers for Unicommerce API
        const headers = {
            clientid: CLIENT_ID,
            merchantid: MERCHANT_ID,
            securitykey: SECURITY_KEY,
            "Content-Type": "application/json",
        };

        // Send the request to Unicommerce API
        const response = await axios.post(UNICOMMERCE_API_URL, orderData, { headers });

        res.status(200).json({
            success: true,
            message: "Order successfully forwarded to Unicommerce",
            data: response.data,
        });
    } catch (error) {
        console.error("Error forwarding order:", error.response ? error.response.data : error.message);
        res.status(500).json({
            success: false,
            message: "Error forwarding order to Unicommerce",
            error: error.response ? error.response.data : error.message,
        });
    }
};
exports.cancelOrderBySeller = async (req, res) => {
    try {
        const { orderId, orderItems } = req.body;

        // Validate request payload
        if (!orderId || !Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({ message: "Invalid request payload" });
        }

        // Convert sellerId from request to ObjectId (assuming it's in req.user.id)
        const sellerId = new mongoose.Types.ObjectId(req.user.id);

        // Find the order belonging to the seller
        const order = await Order.findOne({ _id: orderId, sellerId });

        if (!order) {
            return res.status(404).json({ message: "Order not found or does not belong to the seller" });
        }

        // Track failed cancellations
        let failedItems = [];

        // Process each order item cancellation
        for (const item of orderItems) {
            const { orderItemId, productId, variantId, quantity } = item;

            // Find order item inside the order
            const orderItem = order.items.find(
                (i) => i._id.toString() === orderItemId && i.productId.toString() === productId && i.variantId.toString() === variantId
            );

            if (!orderItem) {
                failedItems.push({ orderItemId, errorMessage: "Order item not found" });
                continue;
            }

            // Reduce quantity or remove item if quantity is 0
            if (orderItem.quantity >= quantity) {
                orderItem.quantity -= quantity;
                if (orderItem.quantity === 0) {
                    order.items = order.items.filter((i) => i._id.toString() !== orderItemId);
                }
            } else {
                failedItems.push({ orderItemId, errorMessage: "Not enough quantity to cancel" });
            }
        }

        // Save updated order
        await order.save();

        // Determine status
        let status = "SUCCESS";
        if (failedItems.length === orderItems.length) status = "FAILED";
        else if (failedItems.length > 0) status = "PARTIAL_SUCCESS";

        // Send response
        res.status(200).json({ status, orderItems: failedItems });

    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.dispatchOrder = async (req, res) => {
    try {
        const { orderItems } = req.body;

        // Validate request body
        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: "Order items are required" });
        }

        // Find all orders that contain at least one matching orderItemId
        const orders = await Order.find({
            "orderItems.orderItemId": { $in: orderItems.map(item => item.orderItemId) }
        });

        if (!orders.length) {
            return res.status(404).json({ message: "No matching order items found" });
        }

        let updatedOrderItems = [];
        for (const order of orders) {
            for (const item of orderItems) {
                const orderItem = order.orderItems.find(i => i.orderItemId === item.orderItemId);
                if (!orderItem) {
                    updatedOrderItems.push({ orderItemId: item.orderItemId, errorMessage: "Order item not found" });
                    continue;
                }
                if (orderItem.status !== "CREATED") {
                    updatedOrderItems.push({ orderItemId: item.orderItemId, errorMessage: "Order item cannot be dispatched" });
                    continue;
                }
                // Update status to DISPATCHED
                orderItem.status = "DISPATCHED";
                updatedOrderItems.push({ orderItemId: item.orderItemId, errorMessage: "" });

            }
            // Save changes
            await order.save();
        }

        res.status(200).json({
            status: "SUCCESS",
            orderItems: updatedOrderItems
        });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


exports.updateOrderItemStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderItems } = req.body;
        console.log("update");

        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({ status: "FAILED", error: "Invalid orderItems payload" });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ status: "FAILED", error: "Order not found" });
        }

        let updatedItems = [];
        let failedItems = [];

        orderItems.forEach((item) => {
            const orderItem = order.orderItems.find(oi => oi.orderItemId === item.orderItemId);
            if (orderItem) {
                if (["DELIVERED", "RETURNED"].includes(item.status)) {
                    orderItem.status = item.status;
                    updatedItems.push({ orderItemId: item.orderItemId });
                } else {
                    failedItems.push({ orderItemId: item.orderItemId, errorMessage: "Invalid status" });
                }
            } else {
                failedItems.push({ orderItemId: item.orderItemId, errorMessage: "Order item not found" });
            }
        });

        // If all items are updated to "RETURNED", update order status as well
        if (order.orderItems.every(oi => oi.status === "RETURNED")) {
            order.orderStatus = "RETURNED";
        }

        await order.save();

        res.json({
            status: failedItems.length === 0 ? "SUCCESS" : "PARTIAL_SUCCESS",
            orderItems: [...updatedItems, ...failedItems],
            error: failedItems.length ? "Some items could not be updated" : ""
        });
    } catch (error) {
        console.error("Error updating order item status:", error);
        res.status(500).json({ status: "FAILED", error: "Internal Server Error" });
    }
};


exports.cancelOrderByMarketPlace = async (req, res) => {
    try {
        const { saleOrderCode, cancelledSkuCodes, cancellationReason, merchantId } = req.body;
        console.log("caclee");

        // Validate request payload
        if (!saleOrderCode || !Array.isArray(cancelledSkuCodes) || cancelledSkuCodes.length === 0 || !cancellationReason || !merchantId) {
            return res.status(400).json({ status: "FAILED", error: "Invalid request payload" });
        }

        // Find the user by merchantId
        const user = await User.findOne({ username: merchantId });

        if (!user) {
            return res.status(404).json({ status: "FAILED", error: "Merchant not found" });
        }

        // Use stored credentials if available, otherwise, reject the request
        const CLIENT_ID = user.client_id || null;
        const SECURITY_KEY = user.security_key || null;

        if (!CLIENT_ID || !SECURITY_KEY) {
            return res.status(400).json({ status: "FAILED", error: "Missing client_id or security_key for this merchant" });
        }

        // Find the order in the database
        const order = await Order.findOne({ displayOrderNumber: saleOrderCode });

        if (!order) {
            return res.status(404).json({ status: "FAILED", error: "Order not found" });
        }

        // Check if the requested items exist in the order
        const validItems = cancelledSkuCodes.every(item =>
            order.orderItems.some(orderItem => orderItem.productId === item.productId && orderItem.variantId === item.variantId)
        );

        if (!validItems) {
            return res.status(400).json({ status: "FAILED", error: "Invalid productId or variantId in cancelledSkuCodes" });
        }

        // Prepare request payload for Uniware
        const uniwarePayload = {
            saleOrderCode,
            cancelledSkuCodes,
            cancellationReason
        };

        // Send request to Uniware API
        const uniwareResponse = await axios.post(UNIWARE_API_URL, uniwarePayload, {
            headers: {
                "Content-Type": "application/json",
                "clientid": CLIENT_ID,
                "merchantid": user.username,
                "securitykey": SECURITY_KEY
            }
        });

        // Check Uniware response
        if (uniwareResponse.data.status === "success") {
            // Update order status in the database
            order.orderStatus = "CANCELLED";
            order.orderItems.forEach(item => {
                if (cancelledSkuCodes.some(cancelled => cancelled.productId === item.productId && cancelled.variantId === item.variantId)) {
                    item.status = "CANCELLED";
                }
            });

            await order.save();

            return res.status(200).json({
                status: "SUCCESS",
                message: "Order cancellation updated successfully",
                data: uniwareResponse.data
            });
        } else {
            return res.status(500).json({
                status: "FAILED",
                error: "Failed to update cancellation in Uniware"
            });
        }

    } catch (error) {
        console.error("Error cancelling order:", error);
        return res.status(500).json({ status: "FAILED", error: "Internal server error" });
    }
};
