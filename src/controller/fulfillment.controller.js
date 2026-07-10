import { PickList, StockReservation, Shipment } from '../model/fulfillment.model.js';
import { SalesOrder } from '../model/sales.model.js';
import { StockItem, InventoryLedger } from '../model/inventory.model.js';
import { Product } from '../model/product.model.js';
import { Location } from '../model/warehouse.model.js';
import {
    createPickListValidation,
    createReservationValidation,
    packCartonsValidation,
    dispatchShipmentValidation,
} from '../validation/fulfillment.validation.js';
import { ApiError } from '../error/api.error.js';

// PickList Controllers
const createPickListController = async (req, res) => {
    const { error, value } = createPickListValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const so = await SalesOrder.findById(value.salesOrderId);
    if (!so) {
        throw new ApiError(404, 'Sales Order not found.');
    }

    if (so.status === 'CANCELLED') {
        throw new ApiError(400, 'Cannot generate picklist for a cancelled Sales Order.');
    }

    const plExists = await PickList.findOne({ code: value.code });
    if (plExists) {
        throw new ApiError(409, 'A picklist with this code already exists.');
    }

    const pickList = await PickList.insertOne({
        salesOrderId: value.salesOrderId,
        code: value.code,
        status: 'DRAFT',
        tasks: value.tasks,
    });

    res.status(201).json({
        success: true,
        message: 'Pick List created successfully',
        data: { pickListId: pickList._id },
    });
};

const getAllPickListsController = async (req, res) => {
    const lists = await PickList.find({}).populate('salesOrderId');
    res.status(200).json({
        success: true,
        data: lists,
    });
};

const getPickListByIDController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Pick List ID is required');
    }

    const pl = await PickList.findById(id)
        .populate('salesOrderId')
        .populate('tasks.productId')
        .populate('tasks.fromLocationId');

    if (!pl) {
        throw new ApiError(404, 'Pick List not found');
    }

    res.status(200).json({
        success: true,
        data: pl,
    });
};

const releasePickListController = async (req, res) => {
    const { id } = req.params;
    const pl = await PickList.findById(id);

    if (!pl) {
        throw new ApiError(404, 'Pick List not found');
    }

    if (pl.status !== 'DRAFT') {
        throw new ApiError(400, 'Only DRAFT picklists can be released.');
    }

    pl.status = 'RELEASED';
    await pl.save();

    res.status(200).json({
        success: true,
        message: 'Pick List released to pickers',
        data: pl,
    });
};

const startPickingController = async (req, res) => {
    const { id } = req.params;
    const pl = await PickList.findById(id);

    if (!pl) {
        throw new ApiError(404, 'Pick List not found');
    }

    if (pl.status !== 'RELEASED') {
        throw new ApiError(400, 'Picking can only start on RELEASED picklists.');
    }

    pl.status = 'START';
    await pl.save();

    res.status(200).json({
        success: true,
        message: 'Picking in progress',
        data: pl,
    });
};

const completePickingController = async (req, res) => {
    const { id } = req.params;
    const pl = await PickList.findById(id);

    if (!pl) {
        throw new ApiError(404, 'Pick List not found');
    }

    if (pl.status !== 'START') {
        throw new ApiError(400, 'Picking can only be completed from START status.');
    }

    const so = await SalesOrder.findById(pl.salesOrderId);
    if (!so || so.status === 'CANCELLED') {
        pl.status = 'CANCELLED';
        await pl.save();
        throw new ApiError(400, 'Associated Sales Order has been cancelled. Picklist cancelled.');
    }

    // Set picking tasks status and quantities
    for (const task of pl.tasks) {
        task.status = 'COMPLETED';
        task.pickedQuantity = task.quantity;
    }

    pl.status = 'COMPLETED';
    await pl.save();

    // Transition SalesOrder status to PROCESSING (picking is finished, ready for packing)
    so.status = 'PROCESSING';
    await so.save();

    res.status(200).json({
        success: true,
        message: 'Picking completed successfully',
        data: pl,
    });
};

// Carton Packing Controller
const packCartonsController = async (req, res) => {
    const { error, value } = packCartonsValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const so = await SalesOrder.findById(value.salesOrderId);
    if (!so) {
        throw new ApiError(404, 'Sales Order not found.');
    }

    if (['DRAFT', 'CONFIRMED'].includes(so.status)) {
        throw new ApiError(400, 'Cannot pack cartons before picking has completed.');
    }

    if (so.status === 'CANCELLED') {
        throw new ApiError(400, 'Cannot pack cartons for cancelled Sales Orders.');
    }

    // Move order state to packed
    so.status = 'COMPLETED'; // In this flow, we will set SalesOrder status to PROCESSING/PACKED.
    // Since our SO enum states are DRAFT, CONFIRMED, PROCESSING, COMPLETED, CANCELLED, let's keep it as is, or we can update SalesOrder description.
    // Let's transition to completed at dispatch. For packing, we will keep it in PROCESSING state.
    await so.save();

    res.status(200).json({
        success: true,
        message: 'Cartons packed successfully. Ready for carrier shipment.',
    });
};

// Shipment & Dispatch Controllers
const dispatchShipmentController = async (req, res) => {
    const { error, value } = dispatchShipmentValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const so = await SalesOrder.findById(value.salesOrderId);
    if (!so) {
        throw new ApiError(404, 'Sales Order not found.');
    }

    if (so.status === 'CANCELLED') {
        throw new ApiError(400, 'Cannot dispatch shipment for cancelled Sales Orders.');
    }

    const shipmentExists = await Shipment.findOne({ shipmentNumber: value.shipmentNumber });
    if (shipmentExists) {
        throw new ApiError(409, 'Shipment number already exists.');
    }

    const shipment = await Shipment.insertOne({
        salesOrderId: value.salesOrderId,
        shipmentNumber: value.shipmentNumber,
        carrier: value.carrier,
        trackingNumber: value.trackingNumber,
        cartons: value.cartons,
        status: 'SHIPPED',
    });

    so.status = 'COMPLETED';
    await so.save();

    res.status(201).json({
        success: true,
        message: 'Shipment created and cargo dispatched',
        data: shipment,
    });
};

const getShipmentHistoryController = async (req, res) => {
    const shipments = await Shipment.find({}).populate('salesOrderId');
    res.status(200).json({
        success: true,
        data: shipments,
    });
};

// Stock Reservation Controllers
const createReservationController = async (req, res) => {
    const { error, value } = createReservationValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const stockItem = await StockItem.findOne({
        productId: value.productId,
        locationId: value.locationId,
    });

    if (!stockItem || stockItem.quantity < value.quantity) {
        throw new ApiError(400, 'Insufficient inventory at the selected location bin to reserve.');
    }

    // Deduct from physical stock to hold reservation
    stockItem.quantity -= value.quantity;
    if (stockItem.quantity === 0) {
        await StockItem.findByIdAndDelete(stockItem._id);
    } else {
        await stockItem.save();
    }

    const product = await Product.findById(value.productId);
    if (product) {
        product.quantity = Math.max(0, product.quantity - value.quantity);
        await product.save();
    }

    const reservation = await StockReservation.insertOne({
        salesOrderId: value.salesOrderId,
        productId: value.productId,
        locationId: value.locationId,
        quantity: value.quantity,
    });

    // Write InventoryLedger
    await InventoryLedger.insertOne({
        productId: value.productId,
        locationId: value.locationId,
        quantityChange: -value.quantity,
        actionType: 'STOCK_OUT',
        userId: req.user.userId,
        reason: `Inventory reservation hold for Sales Order: ${value.salesOrderId}`,
    });

    res.status(201).json({
        success: true,
        message: 'Inventory reserved successfully',
        data: reservation,
    });
};

const listReservationsController = async (req, res) => {
    const list = await StockReservation.find({})
        .populate('salesOrderId')
        .populate('productId')
        .populate('locationId');

    res.status(200).json({
        success: true,
        data: list,
    });
};

const deleteReservationController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Reservation ID is required');
    }

    const reservation = await StockReservation.findById(id);
    if (!reservation) {
        throw new ApiError(404, 'Reservation record not found.');
    }

    // Return stock back to inventory bin
    let stockItem = await StockItem.findOne({
        productId: reservation.productId,
        locationId: reservation.locationId,
    });

    if (stockItem) {
        stockItem.quantity += reservation.quantity;
        await stockItem.save();
    } else {
        stockItem = await StockItem.insertOne({
            productId: reservation.productId,
            locationId: reservation.locationId,
            quantity: reservation.quantity,
        });
    }

    const product = await Product.findById(reservation.productId);
    if (product) {
        product.quantity += reservation.quantity;
        await product.save();
    }

    await InventoryLedger.insertOne({
        productId: reservation.productId,
        locationId: reservation.locationId,
        quantityChange: reservation.quantity,
        actionType: 'STOCK_IN',
        userId: req.user.userId,
        reason: `Released reservation hold ID ${reservation._id}`,
    });

    await StockReservation.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: 'Reservation released and stock returned to inventory.',
    });
};

export {
    createPickListController,
    getAllPickListsController,
    getPickListByIDController,
    releasePickListController,
    startPickingController,
    completePickingController,
    packCartonsController,
    dispatchShipmentController,
    getShipmentHistoryController,
    createReservationController,
    listReservationsController,
    deleteReservationController,
};
