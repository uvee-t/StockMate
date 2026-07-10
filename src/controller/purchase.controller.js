import { PurchaseOrder, GoodsReceipt } from '../model/purchase.model.js';
import { Supplier } from '../model/supplier.model.js';
import { Product } from '../model/product.model.js';
import { Location } from '../model/warehouse.model.js';
import { StockItem, InventoryLedger } from '../model/inventory.model.js';
import { createPOValidation, receiveGoodsValidation } from '../validation/purchase.validation.js';
import { ApiError } from '../error/api.error.js';

const createPurchaseOrderController = async (req, res) => {
    const { error, value } = createPOValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const supplier = await Supplier.findById(value.supplierId);
    if (!supplier) {
        throw new ApiError(404, 'Supplier not found.');
    }

    // Verify all products exist
    for (const line of value.lines) {
        const product = await Product.findById(line.productId);
        if (!product) {
            throw new ApiError(404, `Product with ID ${line.productId} not found.`);
        }
    }

    const poExists = await PurchaseOrder.findOne({ poNumber: value.poNumber });
    if (poExists) {
        throw new ApiError(409, 'A purchase order with this PO number already exists.');
    }

    const po = await PurchaseOrder.insertOne({
        supplierId: value.supplierId,
        poNumber: value.poNumber,
        status: 'DRAFT',
        lines: value.lines,
        userId: req.user.userId,
    });

    res.status(201).json({
        success: true,
        message: 'Purchase Order created',
        data: { poId: po._id },
    });
};

const getAllPOsController = async (req, res) => {
    const pos = await PurchaseOrder.find({})
        .populate('supplierId')
        .populate('userId', 'name email role');

    res.status(200).json({
        success: true,
        data: pos,
    });
};

const getPOByIDController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Purchase Order ID is required');
    }

    const po = await PurchaseOrder.findById(id)
        .populate('supplierId')
        .populate('userId', 'name email role')
        .populate('lines.productId');

    if (!po) {
        throw new ApiError(404, 'Purchase Order not found');
    }

    res.status(200).json({
        success: true,
        data: po,
    });
};

const submitPOController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Purchase Order ID is required');
    }

    const po = await PurchaseOrder.findById(id);
    if (!po) {
        throw new ApiError(404, 'Purchase Order not found');
    }

    if (po.status !== 'DRAFT') {
        throw new ApiError(400, 'Only DRAFT purchase orders can be submitted.');
    }

    po.status = 'SUBMITTED';
    await po.save();

    res.status(200).json({
        success: true,
        message: 'Purchase Order submitted for approval.',
        data: po,
    });
};

const approvePOController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Purchase Order ID is required');
    }

    const po = await PurchaseOrder.findById(id);
    if (!po) {
        throw new ApiError(404, 'Purchase Order not found');
    }

    if (po.status !== 'SUBMITTED') {
        throw new ApiError(400, 'Only SUBMITTED purchase orders can be approved.');
    }

    po.status = 'APPROVED';
    await po.save();

    res.status(200).json({
        success: true,
        message: 'Purchase Order approved.',
        data: po,
    });
};

const rejectPOController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Purchase Order ID is required');
    }

    const po = await PurchaseOrder.findById(id);
    if (!po) {
        throw new ApiError(404, 'Purchase Order not found');
    }

    if (po.status !== 'SUBMITTED') {
        throw new ApiError(400, 'Only SUBMITTED purchase orders can be rejected.');
    }

    po.status = 'REJECTED';
    await po.save();

    res.status(200).json({
        success: true,
        message: 'Purchase Order rejected.',
        data: po,
    });
};

const cancelPOController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Purchase Order ID is required');
    }

    const po = await PurchaseOrder.findById(id);
    if (!po) {
        throw new ApiError(404, 'Purchase Order not found');
    }

    if (['RECEIVED', 'CANCELLED'].includes(po.status)) {
        throw new ApiError(400, `Cannot cancel purchase orders in state: ${po.status}`);
    }

    po.status = 'CANCELLED';
    await po.save();

    res.status(200).json({
        success: true,
        message: 'Purchase Order cancelled.',
        data: po,
    });
};

const receiveGoodsController = async (req, res) => {
    const { id: poId } = req.params;
    const { error, value } = receiveGoodsValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const po = await PurchaseOrder.findById(poId);
    if (!po) {
        throw new ApiError(404, 'Purchase Order not found.');
    }

    if (!['APPROVED', 'PARTIALLY_RECEIVED'].includes(po.status)) {
        throw new ApiError(
            400,
            'Goods can only be received against approved or partially received purchase orders.',
        );
    }

    // Default staging location: get the first location in database
    const location = await Location.findOne({});
    if (!location) {
        throw new ApiError(400, 'No physical warehouse locations exist. Create a location first.');
    }

    const receiptLines = [];
    for (const item of value.lines) {
        const poLine = po.lines.find((line) => line.productId.toString() === item.productId);
        if (!poLine) {
            throw new ApiError(
                400,
                `Product ID ${item.productId} is not registered on this purchase order.`,
            );
        }

        if (poLine.receivedQuantity + item.quantityReceived > poLine.quantity) {
            throw new ApiError(
                400,
                `Receiving quantity exceeds remaining ordered quantity for product ${item.productId}.`,
            );
        }

        poLine.receivedQuantity += item.quantityReceived;
        receiptLines.push(item);
    }

    // Determine status of PO
    const allReceived = po.lines.every((line) => line.receivedQuantity === line.quantity);
    po.status = allReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED';
    await po.save();

    const receiptNumber = `GR-${Date.now()}`;
    const receipt = await GoodsReceipt.insertOne({
        purchaseOrderId: poId,
        receiptNumber,
        lines: receiptLines,
        userId: req.user.userId,
    });

    // Update physical StockItem balances and log InventoryLedgers
    for (const item of receiptLines) {
        let stockItem = await StockItem.findOne({
            productId: item.productId,
            locationId: location._id,
        });

        if (stockItem) {
            stockItem.quantity += item.quantityReceived;
            await stockItem.save();
        } else {
            stockItem = await StockItem.insertOne({
                productId: item.productId,
                locationId: location._id,
                quantity: item.quantityReceived,
                lotNumber: item.lotNumber,
            });
        }

        // Cache total product inventory
        const product = await Product.findById(item.productId);
        if (product) {
            product.quantity += item.quantityReceived;
            await product.save();
        }

        await InventoryLedger.insertOne({
            productId: item.productId,
            locationId: location._id,
            quantityChange: item.quantityReceived,
            actionType: 'STOCK_IN',
            userId: req.user.userId,
            reason: `Goods receipt ${receiptNumber} against PO ${po.poNumber}`,
        });
    }

    res.status(200).json({
        success: true,
        message: 'Goods received successfully and inventory updated',
        data: receipt,
    });
};

export {
    createPurchaseOrderController,
    getAllPOsController,
    getPOByIDController,
    submitPOController,
    approvePOController,
    rejectPOController,
    cancelPOController,
    receiveGoodsController,
};
