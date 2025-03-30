const express = require("express");
const router = express.Router();
const productController = require('../Controller/productController');
const authMiddleware = require("../Middlewares/authenticate");
/**
 * @swagger
 * /api/products/products:
 *   get:
 *     summary: Fetch live products from the marketplace
 *     description: This API fetches live product details such as product ID, variant ID, and SKU code from the marketplace.
 *     tags:
 *       - Products
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: string
*           example: "1"
 *         required: true
 *         description: Page number of the results
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: string
*           example: "50"
 *         required: true
 *         description: Number of products per page
 *       - in: query
 *         name: skus
 *         schema:
 *           type: string
 *         required: false
 *         description: SKU ID of the product 
 *       - in: query
 *         name: publishedStatus
 *         schema:
 *           type: string
 *           enum: [PUBLISHED]
 *         required: true
 *         description: Posting status
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "9485928"
 *                       parentTitle:
 *                         type: string
 *                         example: "Cotton Double Bedsheet with 2 Pillow Covers (Blue)"
 *                       brand:
 *                         type: string
 *                         example: "Bombay Dyeing"
 *                       variants:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             imageUrl:
 *                               type: string
 *                               example: "https://example.com/product.jpg"
 *                             productUrl:
 *                               type: string
 *                               example: "https://marketplace.com/product"
 *                             variantId:
 *                               type: string
 *                               example: "201-grey-XL"
 *                             title:
 *                               type: string
 *                               example: "Cotton Double Size Bedsheet with 2 Pillow Covers (Green)"
 *                             sku:
 *                               type: string
 *                               example: "TShirt-grey-XL"
 *                             size:
 *                               type: string
 *                               example: "60.00X40.00X2.00"
 *                             color:
 *                               type: string
 *                               example: "Blue"
 *                             live:
 *                               type: boolean
 *                               example: true
 *                             productDescription:
 *                               type: string
 *                               example: "High-quality cotton bedsheet"
 *                             itemPrice:
 *                               type: object
 *                               properties:
 *                                 currency:
 *                                   type: string
 *                                   example: "INR"
 *                                 listingPrice:
 *                                   type: number
 *                                   example: 999
 *                                 mrp:
 *                                   type: number
 *                                   example: 1299
 *                                 msp:
 *                                   type: number
 *                                   example: 899
 *                                 netSellerPayable:
 *                                   type: number
 *                                   example: 850
 *                             inventory:
 *                               type: number
 *                               example: 50
 *                             blockedInventory:
 *                               type: number
 *                               example: 5
 *                             pendency:
 *                               type: number
 *                               example: 0
 *                       commissionPercentage:
 *                         type: number
 *                         example: 10.5
 *                       paymentGatewayCharge:
 *                         type: number
 *                         example: 2.5
 *                       logisticsCost:
 *                         type: number
 *                         example: 50
 *                       additionalInfo:
 *                         type: string
 *                         example: "Fast delivery available"
 *                       created:
 *                         type: string
 *                         format: date-time
 *                         example: "2017-01-02T08:12:53"
 *       400:
 *         description: Invalid request or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Validation error"
 *                 data:
 *                   type: object
 *                   example: { "publishedStatus": ["The published status field is required."] }
 *       401:
 *         description: Unauthorized - Invalid API Key or token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid User/Token"
 */

router.get('/products', authMiddleware, productController.getProducts);
/**
 * @swagger
 * /api/products/createProduct:
 *   post:
 *     summary: Create a new product
 *     description: This API allows a seller to create a new product. The seller must be authenticated.
 *     tags: 
 *       - Products
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - parentTitle
 *               - brand
 *               - variants
 *             properties:
 *               parentTitle:
 *                 type: string
 *                 description: Main title of the product.
 *                 example: "Nike Air Max Shoes"
 *               brand:
 *                 type: string
 *                 description: Brand of the product.
 *                 example: "Nike"
 *               variants:
 *                 type: array
 *                 description: List of product variants.
 *                 items:
 *                   type: object
 *                   required:
 *                     - variantId
 *                     - title
 *                     - sku
 *                   properties:
 *                     variantId:
 *                       type: string
 *                       description: Unique identifier for the variant.
 *                       example: "var_001"
 *                     title:
 *                       type: string
 *                       description: Variant title.
 *                       example: "Nike Air Max - Red, Size 10"
 *                     sku:
 *                       type: string
 *                       description: Stock Keeping Unit for inventory management.
 *                       example: "NK-RED-10"
 *                     size:
 *                       type: string
 *                       description: Size of the variant.
 *                       example: "10"
 *                     color:
 *                       type: string
 *                       description: Color of the variant.
 *                       example: "Red"
 *                     inventory:
 *                       type: integer
 *                       description: Number of items in stock.
 *                       example: 100
 *                     blockedInventory:
 *                       type: integer
 *                       description: Inventory currently blocked.
 *                       example: 5
 *                     pendency:
 *                       type: integer
 *                       description: Pending orders.
 *                       example: 2
 *               commissionPercentage:
 *                 type: number
 *                 description: Seller's commission percentage.
 *                 example: 5.0
 *               paymentGatewayCharge:
 *                 type: number
 *                 description: Payment gateway processing charge.
 *                 example: 2.5
 *               logisticsCost:
 *                 type: number
 *                 description: Cost associated with shipping.
 *                 example: 50.0
 *               additionalInfo:
 *                 type: string
 *                 description: Any additional information about the product.
 *                 example: "Limited edition release."
 *     responses:
 *       201:
 *         description: Product created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 product:
 *                   type: object
 *                   description: The newly created product.
 *       400:
 *         description: Missing required fields or validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Missing required fields"
 *       401:
 *         description: Unauthorized - Seller authentication required.
 *       500:
 *         description: Internal server error.
 */

router.post('/createProduct', authMiddleware, productController.createProduct);
/**
 * @swagger
 * /api/products/updateInventory:
 *   post:
 *     summary: Update product inventory
 *     description: Updates the inventory for multiple products based on changes in stock count.
 *     tags:
 *       - Inventory
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inventoryList:
 *                 type: array
 *                 description: List of products with updated inventory
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: Product ID of the product for which inventory needs to be updated
 *                       example: "654321abcdef"
 *                     variantId:
 *                       type: string
 *                       description: Variant ID of the product for which inventory needs to be updated
 *                       example: "654321abcdef-1"
 *                     inventory:
 *                       type: string
 *                       description: The updated stock count
 *                       example: "10"
 *                     hsnCode:
 *                       type: string
 *                       description: 6-digit uniform code that classifies products worldwide (optional)
 *                       example: "123456"
 *                     facilityCode:
 *                       type: string
 *                       description: Warehouse/facility code based on the seller's location mapping (optional)
 *                       example: "WH123"
 *     responses:
 *       200:
 *         description: Inventory updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [SUCCESS, PARTIAL_SUCCESS, FAILED]
 *                   description: Status of the update operation
 *                   example: "SUCCESS"
 *                 failedProductList:
 *                   type: array
 *                   description: List of products whose inventory update failed
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                         example: "654321abcdef"
 *                       variantId:
 *                         type: string
 *                         example: "654321abcdef-1"
 *                       message:
 *                         type: string
 *                         example: "Product or variant not found"
 *       400:
 *         description: Invalid request payload
 *       500:
 *         description: Internal server error
 */

router.post('/updateInventory', productController.updateInventory);

/**
 * @swagger
 * /api/products/productsCount:
 *   get:
 *     summary: Get count of published (live) products
 *     description: Fetches the total count of products that have been published/live on the marketplace.
 *     tags:
 *       - Products
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: publishedStatus
 *         schema:
 *           type: string
 *           enum: [PUBLISHED]
 *         required: true
 *         description: Posting status (fixed to "PUBLISHED")
 *     responses:
 *       200:
 *         description: Successfully retrieved the count of published products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *                   description: Total number of published products (including variants)
 *                   example: 20
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized (invalid API key)
 *       500:
 *         description: Internal server error
 */
router.get('/productsCount', authMiddleware, productController.productsCount);

module.exports = router;
