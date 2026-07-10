import { Customer, SalesOrder } from '../model/sales.model.js';
import { Product } from '../model/product.model.js';
import { Location } from '../model/warehouse.model.js';
import { StockItem, InventoryLedger } from '../model/inventory.model.js';
import {
    createCustomerValidation,
    updateCustomerValidation,
    createSOValidation,
    updateSOValidation,
} from '../validation/sales.validation.js';
import { ApiError } from '../error/api.error.js';

// Customer Controllers
const createCustomerController = async (req, res) => {
    const { error, value } = createCustomerValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const customerExists = await Customer.findOne({ email: value.email });
    if (customerExists) {
        throw new ApiError(409, 'Customer with this email already exists.');
    }

    const customer = await Customer.insertOne({
        name: value.name,
        email: value.email,
        phone: value.phone,
        address: value.address,
    });

    res.status(201).json({
        success: true,
        message: 'Customer created',
        data: { customerId: customer._id },
    });
};

const getAllCustomersController = async (req, res) => {
    const customers = await Customer.find({});
    res.status(200).json({
        success: true,
        data: customers,
    });
};

const getCustomerByIDController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Customer ID is required');
    }

    const customer = await Customer.findById(id);
    if (!customer) {
        throw new ApiError(404, 'Customer not found');
    }

    res.status(200).json({
        success: true,
        data: customer,
    });
};

const updateCustomerController = async (req, res) => {
    const { error, value } = updateCustomerValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Customer ID is required');
    }

    const customerUpdate = await Customer.findByIdAndUpdate(id, value, { new: true });
    if (!customerUpdate) {
        throw new ApiError(404, 'Customer not found.');
    }

    res.status(200).json({
        success: true,
        message: 'Customer updated successfully.',
        data: customerUpdate,
    });
};

const deleteCustomerController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Customer ID is required');
    }

    const customerDelete = await Customer.findByIdAndDelete(id);
    if (!customerDelete) {
        throw new ApiError(404, 'Customer not found.');
    }

    res.status(200).json({
        success: true,
        message: 'Customer deleted successfully.',
        data: customerDelete,
    });
};

// SalesOrder Controllers
const createSOController = async (req, res) => {
    const { error, value } = createSOValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const customer = await Customer.findById(value.customerId);
    if (!customer) {
        throw new ApiError(404, 'Customer not found.');
    }

    // Verify all products exist
    for (const line of value.lines) {
        const product = await Product.findById(line.productId);
        if (!product) {
            throw new ApiError(404, `Product with ID ${line.productId} not found.`);
        }
    }

    const orderExists = await SalesOrder.findOne({ orderNumber: value.orderNumber });
    if (orderExists) {
        throw new ApiError(409, 'A sales order with this order number already exists.');
    }

    const so = await SalesOrder.insertOne({
        customerId: value.customerId,
        orderNumber: value.orderNumber,
        status: 'DRAFT',
        lines: value.lines,
        userId: req.user.userId,
    });

    res.status(201).json({
        success: true,
        message: 'Sales Order created',
        data: { soId: so._id },
    });
};

const getAllSOsController = async (req, res) => {
    const sos = await SalesOrder.find({})
        .populate('customerId')
        .populate('userId', 'name email role');

    res.status(200).json({
        success: true,
        data: sos,
    });
};

const getSOByIDController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Sales Order ID is required');
    }

    const so = await SalesOrder.findById(id)
        .populate('customerId')
        .populate('userId', 'name email role')
        .populate('lines.productId');

    if (!so) {
        throw new ApiError(404, 'Sales Order not found');
    }

    res.status(200).json({
        success: true,
        data: so,
    });
};

const updateSOController = async (req, res) => {
    const { error, value } = updateSOValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Sales Order ID is required');
    }

    const so = await SalesOrder.findById(id);
    if (!so) {
        throw new ApiError(404, 'Sales Order not found.');
    }

    if (so.status !== 'DRAFT') {
        throw new ApiError(400, 'Only DRAFT sales orders can be updated.');
    }

    const soUpdate = await SalesOrder.findByIdAndUpdate(id, value, { new: true });

    res.status(200).json({
        success: true,
        message: 'Sales Order updated successfully.',
        data: soUpdate,
    });
};

const deleteSOController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Sales Order ID is required');
    }

    const so = await SalesOrder.findById(id);
    if (!so) {
        throw new ApiError(404, 'Sales Order not found');
    }

    if (so.status !== 'DRAFT') {
        throw new ApiError(400, 'Only DRAFT sales orders can be deleted.');
    }

    await SalesOrder.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: 'Sales Order deleted successfully.',
    });
};

const confirmSOController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Sales Order ID is required');
    }

    const so = await SalesOrder.findById(id);
    if (!so) {
        throw new ApiError(404, 'Sales Order not found.');
    }

    if (so.status !== 'DRAFT') {
        throw new ApiError(400, 'Only DRAFT sales orders can be confirmed.');
    }

    // Step 1: Validate physical stock availability across the warehouse location bins
    for (const line of so.lines) {
        const stockItems = await StockItem.find({ productId: line.productId });
        const totalStock = stockItems.reduce((acc, item) => acc + item.quantity, 0);

        if (totalStock < line.quantity) {
            throw new ApiError(
                400,
                `Insufficient stock for product ID ${line.productId}. Required: ${line.quantity}, Available: ${totalStock}`,
            );
        }
    }

    // Step 2: Deduct physical stock from location bins and log ledgers
    for (const line of so.lines) {
        let remainingToDeduct = line.quantity;
        const stockItems = await StockItem.find({ productId: line.productId }).sort({
            quantity: -1,
        });

        for (const item of stockItems) {
            const deductQty = Math.min(remainingToDeduct, item.quantity);
            item.quantity -= deductQty;

            if (item.quantity === 0) {
                await StockItem.findByIdAndDelete(item._id);
            } else {
                await item.save();
            }

            // Write InventoryLedger record
            await InventoryLedger.insertOne({
                productId: line.productId,
                locationId: item.locationId,
                quantityChange: -deductQty,
                actionType: 'STOCK_OUT',
                userId: req.user.userId,
                reason: `Stock deduction for confirmed Sales Order: ${so.orderNumber}`,
            });

            // Decrement total quantity in product catalog
            const product = await Product.findById(line.productId);
            if (product) {
                product.quantity = Math.max(0, product.quantity - deductQty);
                await product.save();
            }

            remainingToDeduct -= deductQty;
            if (remainingToDeduct === 0) break;
        }
    }

    so.status = 'CONFIRMED';
    await so.save();

    res.status(200).json({
        success: true,
        message: 'Sales Order confirmed successfully and inventory stock reduced.',
        data: so,
    });
};

const cancelSOController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Sales Order ID is required');
    }

    const so = await SalesOrder.findById(id);
    if (!so) {
        throw new ApiError(404, 'Sales Order not found.');
    }

    if (['COMPLETED', 'CANCELLED'].includes(so.status)) {
        throw new ApiError(400, `Cannot cancel order in state: ${so.status}`);
    }

    const originalStatus = so.status;

    // If order was confirmed/processing, return deducted stock back to default staging bin
    if (['CONFIRMED', 'PROCESSING'].includes(originalStatus)) {
        const location = await Location.findOne({});
        if (!location) {
            throw new ApiError(500, 'No physical warehouse locations exist. Cannot return stock.');
        }

        for (const line of so.lines) {
            let stockItem = await StockItem.findOne({
                productId: line.productId,
                locationId: location._id,
            });

            if (stockItem) {
                stockItem.quantity += line.quantity;
                await stockItem.save();
            } else {
                stockItem = await StockItem.insertOne({
                    productId: line.productId,
                    locationId: location._id,
                    quantity: line.quantity,
                });
            }

            const product = await Product.findById(line.productId);
            if (product) {
                product.quantity += line.quantity;
                await product.save();
            }

            await InventoryLedger.insertOne({
                productId: line.productId,
                locationId: location._id,
                quantityChange: line.quantity,
                actionType: 'STOCK_IN',
                userId: req.user.userId,
                reason: `Returned stock from cancelled Sales Order: ${so.orderNumber}`,
            });
        }
    }

    so.status = 'CANCELLED';
    await so.save();

    res.status(200).json({
        success: true,
        message: 'Sales Order cancelled successfully and stock returned to inventory.',
        data: so,
    });
};

const processSOController = async (req, res) => {
    const { id } = req.params;
    const so = await SalesOrder.findById(id);
    if (!so) throw new ApiError(404, 'Sales Order not found');

    if (so.status !== 'CONFIRMED') {
        throw new ApiError(400, 'Order can only transition to PROCESSING from CONFIRMED status.');
    }

    so.status = 'PROCESSING';
    await so.save();

    res.status(200).json({
        success: true,
        message: 'Sales Order status updated to processing.',
        data: so,
    });
};

const completeSOController = async (req, res) => {
    const { id } = req.params;
    const so = await SalesOrder.findById(id);
    if (!so) throw new ApiError(404, 'Sales Order not found');

    if (so.status !== 'PROCESSING') {
        throw new ApiError(400, 'Order can only transition to COMPLETED from PROCESSING status.');
    }

    so.status = 'COMPLETED';
    await so.save();

    res.status(200).json({ success: true, message: 'Sales Order status completed.', data: so });
};

export {
    createCustomerController,
    getAllCustomersController,
    getCustomerByIDController,
    updateCustomerController,
    deleteCustomerController,
    createSOController,
    getAllSOsController,
    getSOByIDController,
    updateSOController,
    deleteSOController,
    confirmSOController,
    cancelSOController,
    processSOController,
    completeSOController,
};
