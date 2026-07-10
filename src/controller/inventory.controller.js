import { StockItem, InventoryLedger } from '../model/inventory.model.js';
import { Product } from '../model/product.model.js';
import { Location } from '../model/warehouse.model.js';
import {
    stockInValidationSchema,
    stockOutValidationSchema,
    stockAdjustValidationSchema,
    stockTransferValidationSchema,
} from '../validation/inventory.validation.js';
import { ApiError } from '../error/api.error.js';

const stockInController = async (req, res) => {
    const { error, value } = stockInValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const product = await Product.findById(value.productId);
    if (!product) {
        throw new ApiError(404, 'Product not found.');
    }

    const location = await Location.findById(value.locationId);
    if (!location) {
        throw new ApiError(404, 'Location bin not found.');
    }

    let stockItem = await StockItem.findOne({
        productId: value.productId,
        locationId: value.locationId,
    });

    if (stockItem) {
        stockItem.quantity += value.quantity;
        await stockItem.save();
    } else {
        stockItem = await StockItem.insertOne({
            productId: value.productId,
            locationId: value.locationId,
            quantity: value.quantity,
            lotNumber: value.lotNumber,
            serialNumber: value.serialNumber,
        });
    }

    // Update the product's direct total quantity cache (if exists in Product Schema)
    product.quantity += value.quantity;
    await product.save();

    await InventoryLedger.insertOne({
        productId: value.productId,
        locationId: value.locationId,
        quantityChange: value.quantity,
        actionType: 'STOCK_IN',
        userId: req.user.userId,
        reason: 'Goods received check-in',
    });

    res.status(200).json({
        success: true,
        message: 'Stock received successfully',
        data: stockItem,
    });
};

const stockOutController = async (req, res) => {
    const { error, value } = stockOutValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const product = await Product.findById(value.productId);
    if (!product) {
        throw new ApiError(404, 'Product not found.');
    }

    const stockItem = await StockItem.findOne({
        productId: value.productId,
        locationId: value.locationId,
    });

    if (!stockItem || stockItem.quantity < value.quantity) {
        throw new ApiError(
            400,
            'Insufficient inventory for this product at the specified location.',
        );
    }

    stockItem.quantity -= value.quantity;
    if (stockItem.quantity === 0) {
        await StockItem.findByIdAndDelete(stockItem._id);
    } else {
        await stockItem.save();
    }

    product.quantity = Math.max(0, product.quantity - value.quantity);
    await product.save();

    await InventoryLedger.insertOne({
        productId: value.productId,
        locationId: value.locationId,
        quantityChange: -value.quantity,
        actionType: 'STOCK_OUT',
        userId: req.user.userId,
        reason: 'Goods dispatch',
    });

    res.status(200).json({
        success: true,
        message: 'Stock dispatched successfully',
    });
};

const stockAdjustController = async (req, res) => {
    const { error, value } = stockAdjustValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const product = await Product.findById(value.productId);
    if (!product) {
        throw new ApiError(404, 'Product not found.');
    }

    const location = await Location.findById(value.locationId);
    if (!location) {
        throw new ApiError(404, 'Location bin not found.');
    }

    let stockItem = await StockItem.findOne({
        productId: value.productId,
        locationId: value.locationId,
    });

    if (stockItem) {
        stockItem.quantity += value.quantity;
        if (stockItem.quantity < 0) {
            throw new ApiError(400, 'Adjustment would result in negative inventory quantity.');
        }
        if (stockItem.quantity === 0) {
            await StockItem.findByIdAndDelete(stockItem._id);
        } else {
            await stockItem.save();
        }
    } else {
        if (value.quantity < 0) {
            throw new ApiError(400, 'Cannot adjust negative quantity for non-existent stock item.');
        }
        stockItem = await StockItem.insertOne({
            productId: value.productId,
            locationId: value.locationId,
            quantity: value.quantity,
        });
    }

    product.quantity = Math.max(0, product.quantity + value.quantity);
    await product.save();

    await InventoryLedger.insertOne({
        productId: value.productId,
        locationId: value.locationId,
        quantityChange: value.quantity,
        actionType: 'ADJUST',
        userId: req.user.userId,
        reason: value.reason,
    });

    res.status(200).json({
        success: true,
        message: 'Stock adjusted successfully',
        data: stockItem,
    });
};

const stockTransferController = async (req, res) => {
    const { error, value } = stockTransferValidationSchema.validate(req.body, {
        abortEarly: false,
    });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const sourceStock = await StockItem.findOne({
        productId: value.productId,
        locationId: value.fromLocationId,
    });

    if (!sourceStock || sourceStock.quantity < value.quantity) {
        throw new ApiError(400, 'Insufficient stock at source location.');
    }

    const destLocation = await Location.findById(value.toLocationId);
    if (!destLocation) {
        throw new ApiError(404, 'Destination location bin not found.');
    }

    sourceStock.quantity -= value.quantity;
    if (sourceStock.quantity === 0) {
        await StockItem.findByIdAndDelete(sourceStock._id);
    } else {
        await sourceStock.save();
    }

    let destStock = await StockItem.findOne({
        productId: value.productId,
        locationId: value.toLocationId,
    });

    if (destStock) {
        destStock.quantity += value.quantity;
        await destStock.save();
    } else {
        destStock = await StockItem.insertOne({
            productId: value.productId,
            locationId: value.toLocationId,
            quantity: value.quantity,
        });
    }

    // Ledger logs (two legs of transfer)
    await InventoryLedger.insertOne({
        productId: value.productId,
        locationId: value.fromLocationId,
        quantityChange: -value.quantity,
        actionType: 'TRANSFER',
        userId: req.user.userId,
        reason: `Transfer to location ID ${value.toLocationId}. Reason: ${value.reason || 'None'}`,
    });

    await InventoryLedger.insertOne({
        productId: value.productId,
        locationId: value.toLocationId,
        quantityChange: value.quantity,
        actionType: 'TRANSFER',
        userId: req.user.userId,
        reason: `Transfer from location ID ${value.fromLocationId}. Reason: ${value.reason || 'None'}`,
    });

    res.status(200).json({
        success: true,
        message: 'Stock transferred successfully',
    });
};

const queryCurrentStockController = async (req, res) => {
    const { productId, locationId, sku, search } = req.query;
    const filter = {};

    if (productId) filter.productId = productId;
    if (locationId) filter.locationId = locationId;

    let items = await StockItem.find(filter).populate('productId').populate('locationId');

    if (sku || search) {
        items = items.filter((item) => {
            const prod = item.productId;
            if (!prod) return false;
            let match = true;
            if (sku) match = match && prod.sku.toUpperCase() === sku.toUpperCase();
            if (search) match = match && prod.name.toLowerCase().includes(search.toLowerCase());
            return match;
        });
    }

    res.status(200).json({
        success: true,
        data: items,
    });
};

const getLedgerHistoryController = async (req, res) => {
    const ledger = await InventoryLedger.find({})
        .populate('productId')
        .populate('locationId')
        .populate('userId', 'name email role');

    res.status(200).json({
        success: true,
        data: ledger,
    });
};

const getLowStockController = async (req, res) => {
    const items = await StockItem.find({ quantity: { $lt: 15 } })
        .populate('productId')
        .populate('locationId');

    res.status(200).json({
        success: true,
        data: items,
    });
};

const getOutOfStockController = async (req, res) => {
    const activeProducts = await StockItem.distinct('productId');
    const outOfStockProducts = await Product.find({ _id: { $nin: activeProducts } });

    res.status(200).json({
        success: true,
        data: outOfStockProducts,
    });
};

export {
    stockInController,
    stockOutController,
    stockAdjustController,
    stockTransferController,
    queryCurrentStockController,
    getLedgerHistoryController,
    getLowStockController,
    getOutOfStockController,
};
