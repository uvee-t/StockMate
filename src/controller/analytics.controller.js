import { SavedReport, ReportHistory } from '../model/analytics.model.js';
import { Product } from '../model/product.model.js';
import { Supplier } from '../model/supplier.model.js';
import { Customer, SalesOrder } from '../model/sales.model.js';
import { Warehouse, Location } from '../model/warehouse.model.js';
import { StockItem } from '../model/inventory.model.js';
import { PurchaseOrder } from '../model/purchase.model.js';
import {
    createSavedReportValidation,
    generateReportValidation,
} from '../validation/analytics.validation.js';
import { ApiError } from '../error/api.error.js';

// SavedReport CRUD
const createSavedReportController = async (req, res) => {
    const { error, value } = createSavedReportValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const report = await SavedReport.insertOne({
        name: value.name,
        reportType: value.reportType,
        filters: value.filters,
        userId: req.user.userId,
    });

    res.status(201).json({
        success: true,
        message: 'Saved Report configuration created successfully.',
        data: report,
    });
};

const getAllSavedReportsController = async (req, res) => {
    const reports = await SavedReport.find({ userId: req.user.userId });
    res.status(200).json({
        success: true,
        data: reports,
    });
};

const deleteSavedReportController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Report ID is required');
    }

    const report = await SavedReport.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!report) {
        throw new ApiError(404, 'Saved Report configuration not found.');
    }

    res.status(200).json({
        success: true,
        message: 'Saved Report configuration deleted successfully.',
    });
};

// Internal aggregation helpers
const runInventorySummary = async () => {
    const summary = await StockItem.aggregate([
        {
            $group: {
                _id: '$productId',
                totalPhysicalQuantity: { $sum: '$quantity' },
                locationCount: { $addToSet: '$locationId' },
            },
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'productDetails',
            },
        },
        {
            $unwind: '$productDetails',
        },
        {
            $project: {
                productId: '$_id',
                name: '$productDetails.name',
                sku: '$productDetails.sku',
                price: '$productDetails.price',
                totalPhysicalQuantity: 1,
                locationCount: { $size: '$locationCount' },
            },
        },
    ]);
    return summary;
};

const runSalesSummary = async () => {
    const summary = await SalesOrder.aggregate([
        {
            $group: {
                _id: '$status',
                orderCount: { $sum: 1 },
                totalRevenue: {
                    $sum: {
                        $sum: {
                            $map: {
                                input: '$lines',
                                as: 'line',
                                in: { $multiply: ['$$line.quantity', '$$line.unitPrice'] },
                            },
                        },
                    },
                },
            },
        },
    ]);
    return summary;
};

const runPurchaseSummary = async () => {
    const summary = await PurchaseOrder.aggregate([
        {
            $group: {
                _id: '$status',
                poCount: { $sum: 1 },
                totalSpend: {
                    $sum: {
                        $sum: {
                            $map: {
                                input: '$lines',
                                as: 'line',
                                in: { $multiply: ['$$line.quantity', '$$line.unitPrice'] },
                            },
                        },
                    },
                },
            },
        },
    ]);
    return summary;
};

const runWarehouseSummary = async () => {
    const summary = await StockItem.aggregate([
        {
            $group: {
                _id: '$locationId',
                itemCount: { $sum: 1 },
                totalQuantity: { $sum: '$quantity' },
            },
        },
        {
            $lookup: {
                from: 'locations',
                localField: '_id',
                foreignField: '_id',
                as: 'locationDetails',
            },
        },
        {
            $unwind: '$locationDetails',
        },
        {
            $project: {
                locationId: '$_id',
                name: '$locationDetails.name',
                code: '$locationDetails.code',
                itemCount: 1,
                totalQuantity: 1,
            },
        },
    ]);
    return summary;
};

// Analytics Controllers
const getDashboardSummaryController = async (req, res) => {
    const productCount = await Product.countDocuments();
    const supplierCount = await Supplier.countDocuments();
    const customerCount = await Customer.countDocuments();
    const warehouseCount = await Warehouse.countDocuments();

    const stockSummary = await StockItem.aggregate([
        {
            $group: {
                _id: null,
                totalUnits: { $sum: '$quantity' },
            },
        },
    ]);

    const salesSummary = await SalesOrder.aggregate([
        { $match: { status: { $ne: 'CANCELLED' } } },
        {
            $group: {
                _id: null,
                totalRevenue: {
                    $sum: {
                        $sum: {
                            $map: {
                                input: '$lines',
                                as: 'line',
                                in: { $multiply: ['$$line.quantity', '$$line.unitPrice'] },
                            },
                        },
                    },
                },
            },
        },
    ]);

    res.status(200).json({
        success: true,
        data: {
            counts: {
                products: productCount,
                suppliers: supplierCount,
                customers: customerCount,
                warehouses: warehouseCount,
            },
            inventoryValue: {
                totalUnits: stockSummary[0]?.totalUnits || 0,
            },
            salesValue: {
                totalRevenue: salesSummary[0]?.totalRevenue || 0,
            },
        },
    });
};

const getInventorySummaryController = async (req, res) => {
    const summary = await runInventorySummary();
    res.status(200).json({
        success: true,
        data: summary,
    });
};

const getSalesSummaryController = async (req, res) => {
    const summary = await runSalesSummary();
    res.status(200).json({
        success: true,
        data: summary,
    });
};

const getPurchaseSummaryController = async (req, res) => {
    const summary = await runPurchaseSummary();
    res.status(200).json({
        success: true,
        data: summary,
    });
};

const getWarehouseSummaryController = async (req, res) => {
    const summary = await runWarehouseSummary();
    res.status(200).json({
        success: true,
        data: summary,
    });
};

const getLowStockSummaryController = async (req, res) => {
    const threshold = 15;
    const lowStock = await Product.find({ quantity: { $lte: threshold } }).select(
        'name sku quantity price',
    );

    res.status(200).json({
        success: true,
        data: lowStock,
    });
};

const getTopSellingProductsController = async (req, res) => {
    const topProducts = await SalesOrder.aggregate([
        { $match: { status: 'COMPLETED' } },
        { $unwind: '$lines' },
        {
            $group: {
                _id: '$lines.productId',
                totalQuantitySold: { $sum: '$lines.quantity' },
            },
        },
        { $sort: { totalQuantitySold: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'productDetails',
            },
        },
        { $unwind: '$productDetails' },
        {
            $project: {
                productId: '$_id',
                name: '$productDetails.name',
                sku: '$productDetails.sku',
                totalQuantitySold: 1,
            },
        },
    ]);

    res.status(200).json({
        success: true,
        data: topProducts,
    });
};

const generateReportMetadataController = async (req, res) => {
    const { error, value } = generateReportValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    let summaryData = null;
    if (value.reportType === 'INVENTORY') {
        summaryData = await runInventorySummary();
    } else if (value.reportType === 'SALES') {
        summaryData = await runSalesSummary();
    } else if (value.reportType === 'PURCHASE') {
        summaryData = await runPurchaseSummary();
    } else if (value.reportType === 'WAREHOUSE') {
        summaryData = await runWarehouseSummary();
    }

    const history = await ReportHistory.insertOne({
        reportType: value.reportType,
        generatedBy: req.user.userId,
        parameters: value.filters,
        summaryData,
    });

    res.status(201).json({
        success: true,
        message: 'Report generated and logged in history.',
        data: history,
    });
};

const getReportHistoryController = async (req, res) => {
    const history = await ReportHistory.find({ generatedBy: req.user.userId })
        .populate('generatedBy', 'name email role')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: history,
    });
};

export {
    createSavedReportController,
    getAllSavedReportsController,
    deleteSavedReportController,
    getDashboardSummaryController,
    getInventorySummaryController,
    getSalesSummaryController,
    getPurchaseSummaryController,
    getWarehouseSummaryController,
    getLowStockSummaryController,
    getTopSellingProductsController,
    generateReportMetadataController,
    getReportHistoryController,
};
