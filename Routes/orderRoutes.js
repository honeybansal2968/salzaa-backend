const express = require("express");
const router = express.Router();
const orderController = require('../Controller/orderController');
const authMiddleware = require("../Middlewares/authenticate");

/**
 * @swagger
 * /api/orders/createOrderByUser:
 *   post:
 *     summary: Create a new order
 *     description: API to create an order with required and optional fields.
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderDate
 *               - orderStatus
 *               - sla
 *               - orderItems
 *               - thirdPartyShipping
 *               - shippingAddress
 *               - billingAddress
 *             properties:
 *               displayOrderNumber:
 *                 type: string
 *                 example: "ABCDE"
 *               orderDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2022-12-02T08:12:53Z"
 *               orderStatus:
 *                 type: string
 *                 enum: ["PENDING_VERIFICATION", "CREATED", "CANCELLED"]
 *                 example: "CREATED"
 *               sla:
 *                 type: string
 *                 format: date-time
 *                 example: "2022-12-05T08:12:53Z"
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - orderItemId
 *                     - status
 *                     - productId
 *                     - variantId
 *                     - sku
 *                     - title
 *                     - orderItemPrice
 *                     - quantity
 *                   properties:
 *                     orderItemId:
 *                       type: string
 *                       example: "ITEM123"
 *                     status:
 *                       type: string
 *                       enum: ["CANCELLED", "CREATED", "DISPATCHED", "DELIVERED"]
 *                     title:
 *                       type: string
 *                       example: "Product A"
 *                     sku:
 *                       type: string
 *                       example: "SKU123"
 *                     quantity:
 *                       type: number
 *                       example: 2
 *                     variantId:
 *                       type: string
 *                       example: "VAR123"
 *                     productId:
 *                       type: string
 *                       example: "PROD456"
 *                     orderItemPrice:
 *                       type: object
 *                       required:
 *                         - sellingPrice
 *                         - totalPrice
 *                       properties:
 *                         sellingPrice:
 *                           type: number
 *                           example: 200
 *                         totalPrice:
 *                           type: number
 *                           example: 200
 *                         cashOnDeliveryCharges:
 *                           type: number
 *                           example: 50
 *                         shippingCharges:
 *                           type: number
 *                           example: 30
 *                         discount:
 *                           type: number
 *                           example: 10
 *                         transferPrice:
 *                           type: number
 *                           example: 180
 *                         currency:
 *                           type: string
 *                           example: "INR"
 *               thirdPartyShipping:
 *                 type: boolean
 *                 example: false
 *               billingAddress:
 *                 type: object
 *                 properties:
 *                   addressLine1:
 *                     type: string
 *                     example: "456 Avenue"
 *                   city:
 *                     type: string
 *                     example: "New York"
 *                   country:
 *                     type: string
 *                     example: "USA"
 *                   phone:
 *                     type: string
 *                     example: "9876543210"
 *                   pincode:
 *                     type: string
 *                     example: "10001"
 *                   state:
 *                     type: string
 *                     example: "NY"
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *               shippingAddress:
 *                 type: object
 *                 required:
 *                   - addressLine1
 *                   - city
 *                   - country
 *                   - name
 *                   - phone
 *                   - pincode
 *                   - state
 *                 properties:
 *                   addressLine1:
 *                     type: string
 *                     example: "123 Street Name"
 *                   city:
 *                     type: string
 *                     example: "Surat"
 *                   country:
 *                     type: string
 *                     example: "India"
 *                   name:
 *                     type: string
 *                     example: "John Doe2"
 *                   phone:
 *                     type: string
 *                     example: "9876543210"
 *                   pincode:
 *                     type: string
 *                     example: "395006"
 *                   state:
 *                     type: string
 *                     example: "Gujarat"
 *     responses:
 *       201:
 *         description: Order successfully created.
 *       400:
 *         description: Invalid request parameters.
 */
router.post('/createOrderByUser', authMiddleware, orderController.createOrderByUser);

/**
 * @swagger
 * /api/orders/createOrderToUC:
 *   post:
 *     summary: Forward the created order to Unicommerce
 *     description: This API forwards a created order to Unicommerce's order creation API.
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: The order object without createdAt, updatedAt, or __v.
 *     responses:
 *       200:
 *         description: Order successfully forwarded to Unicommerce.
 *       400:
 *         description: Invalid request parameters.
 *       500:
 *         description: Error while forwarding order to Unicommerce.
 */

router.post('/createOrderToUC', orderController.forwardOrderToUnicommerce);
/**
 * @swagger
 * /api/orders/cancel:
 *   post:
 *     summary: Cancel an order (partial or full) by seller
 *     description: Allows a seller to cancel order items in an order they own. Supports partial cancellation.
 *     tags:
 *       - Orders
 *     security:
 *       - BearerAuth: []  # Assuming you're using JWT authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - orderItems
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: ID of the order to be cancelled
 *                 example: 67bffadbbcc9fe8eb619266f
 *               orderItems:
 *                 type: array
 *                 description: List of order items to be cancelled
 *                 items:
 *                   type: object
 *                   required:
 *                     - orderItemId
 *                     - productId
 *                     - variantId
 *                     - quantity
 *                   properties:
 *                     orderItemId:
 *                       type: string
 *                       description: ID of the order item to be cancelled
 *                       example: ITEM124
 *                     productId:
 *                       type: string
 *                       description: Product ID of the item
 *                     variantId:
 *                       type: string
 *                       description: Variant ID of the product
 *                     quantity:
 *                       type: integer
 *                       description: Quantity to be cancelled
 *                       minimum: 1
 *     responses:
 *       200:
 *         description: Order cancellation status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [SUCCESS, FAILED, PARTIAL_SUCCESS]
 *                   description: Indicates the cancellation status
 *                 orderItems:
 *                   type: array
 *                   description: List of failed cancellations, if any
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderItemId:
 *                         type: string
 *                         description: Order item ID that failed to cancel
 *                       errorMessage:
 *                         type: string
 *                         description: Reason for failure
 *       400:
 *         description: Bad request (invalid payload)
 *       404:
 *         description: Order not found or not owned by the seller
 *       500:
 *         description: Internal server error
 */

router.post('/cancel', authMiddleware, orderController.cancelOrderBySeller);

/**
 * @swagger
 * /api/orders/dispatch:
 *   post:
 *     summary: Dispatch an order
 *     description: Updates the status of order items to "DISPATCHED" and optionally updates order status if all items are dispatched.
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     orderItemId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Order dispatch success
 *       400:
 *         description: Bad request
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.post("/dispatch", authMiddleware, orderController.dispatchOrder);


/**
 * @swagger
 * /api/orders/cancelOrderByMarketPlace:
 *   post:
 *     summary: Cancel an order and notify Uniware
 *     description: This API cancels an order and sends the cancellation request to Uniware with merchant-specific authentication details.
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - saleOrderCode
 *               - cancelledSkuCodes
 *               - cancellationReason
 *               - merchantId
 *             properties:
 *               saleOrderCode:
 *                 type: string
 *                 description: The unique code of the order to be canceled.
 *                 example: "ORD12345"
 *               cancelledSkuCodes:
 *                 type: array
 *                 description: List of cancelled order items.
 *                 items:
 *                   type: object
 *                   required:
 *                     - quantity
 *                     - productId
 *                     - variantId
 *                   properties:
 *                     quantity:
 *                       type: integer
 *                       description: Quantity of the product to be cancelled.
 *                       example: 2
 *                     productId:
 *                       type: string
 *                       description: Product ID of the item.
 *                       example: "PROD001"
 *                     variantId:
 *                       type: string
 *                       description: Variant ID of the item.
 *                       example: "VAR001"
 *               cancellationReason:
 *                 type: string
 *                 description: Reason for the cancellation.
 *                 example: "Customer request"
 *               merchantId:
 *                 type: string
 *                 description: The merchant's username (used to fetch client credentials).
 *                 example: "seller_id"
 *     responses:
 *       200:
 *         description: Order cancellation successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "SUCCESS"
 *                 message:
 *                   type: string
 *                   example: "Order cancellation updated successfully"
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Invalid request payload or missing authentication details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "FAILED"
 *                 error:
 *                   type: string
 *                   example: "Invalid request payload"
 *       404:
 *         description: Order or Merchant not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "FAILED"
 *                 error:
 *                   type: string
 *                   example: "Order not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "FAILED"
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/cancelOrderByMarketPlace", orderController.cancelOrderByMarketPlace);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   post:
 *     summary: Update order item status (DELIVERED or RETURNED)
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: Unique identifier for an order
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     orderItemId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [DELIVERED, RETURNED]
 *                     IsReverse:
 *                       type: boolean
 *                     courier_status:
 *                       type: string
 *                     updated:
 *                       type: string
 *                       format: date-time
 *     responses:
 *       200:
 *         description: Order item status updated successfully
 *       400:
 *         description: Invalid request payload
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.post("/:orderId", authMiddleware, orderController.updateOrderItemStatus);
module.exports = router;
