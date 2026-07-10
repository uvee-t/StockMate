import {
    NotificationTemplate,
    NotificationPreference,
    Notification,
} from '../model/notification.model.js';
import { User } from '../model/user.model.js';
import {
    createTemplateValidation,
    updatePreferenceValidation,
    sendNotificationValidation,
} from '../validation/notification.validation.js';
import { ApiError } from '../error/api.error.js';

// Template Controllers
const createTemplateController = async (req, res) => {
    const { error, value } = createTemplateValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const templateExists = await NotificationTemplate.findOne({ name: value.name });
    if (templateExists) {
        throw new ApiError(409, 'A template with this name already exists.');
    }

    const template = await NotificationTemplate.insertOne({
        name: value.name,
        subject: value.subject || '',
        body: value.body,
        channels: value.channels,
    });

    res.status(201).json({
        success: true,
        message: 'Notification template created successfully',
        data: template,
    });
};

const getAllTemplatesController = async (req, res) => {
    const templates = await NotificationTemplate.find({});
    res.status(200).json({
        success: true,
        data: templates,
    });
};

const deleteTemplateController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Template ID is required');
    }

    const template = await NotificationTemplate.findByIdAndDelete(id);
    if (!template) {
        throw new ApiError(404, 'Template not found');
    }

    res.status(200).json({
        success: true,
        message: 'Notification template deleted successfully',
    });
};

// Preferences Controllers
const getPreferenceController = async (req, res) => {
    let preference = await NotificationPreference.findOne({ userId: req.user.userId });

    if (!preference) {
        preference = await NotificationPreference.insertOne({
            userId: req.user.userId,
            channelsEnabled: ['EMAIL', 'IN_APP'],
        });
    }

    res.status(200).json({
        success: true,
        data: preference,
    });
};

const updatePreferenceController = async (req, res) => {
    const { error, value } = updatePreferenceValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    let preference = await NotificationPreference.findOne({ userId: req.user.userId });
    if (preference) {
        preference.channelsEnabled = value.channelsEnabled;
        await preference.save();
    } else {
        preference = await NotificationPreference.insertOne({
            userId: req.user.userId,
            channelsEnabled: value.channelsEnabled,
        });
    }

    res.status(200).json({
        success: true,
        message: 'Notification preferences updated successfully.',
        data: preference,
    });
};

// Notification Log History Controllers
const sendNotificationController = async (req, res) => {
    const { error, value } = sendNotificationValidation.validate(req.body, { abortEarly: false });

    if (error) {
        throw new ApiError(
            400,
            'Validation Error',
            error.details.map((detail) => detail.message),
        );
    }

    const recipient = await User.findById(value.recipientId);
    if (!recipient) {
        throw new ApiError(404, 'Recipient user not found.');
    }

    // Check recipient delivery preference rules
    const preference = await NotificationPreference.findOne({ userId: value.recipientId });
    let deliveryStatus = 'SENT';

    if (preference && !preference.channelsEnabled.includes(value.channel)) {
        deliveryStatus = 'FAILED';
    }

    const notification = await Notification.insertOne({
        recipientId: value.recipientId,
        senderId: req.user.userId,
        title: value.title,
        message: value.message,
        channel: value.channel,
        templateId: value.templateId || null,
        status: deliveryStatus,
    });

    res.status(201).json({
        success: true,
        message:
            deliveryStatus === 'FAILED'
                ? 'Notification marked as FAILED because recipient has disabled this channel.'
                : 'Notification dispatched and registered successfully.',
        data: notification,
    });
};

const getNotificationHistoryController = async (req, res) => {
    const { channel, status } = req.query;
    const filter = { recipientId: req.user.userId };

    if (channel) {
        filter.channel = channel;
    }
    if (status) {
        filter.status = status;
    }

    const list = await Notification.find(filter)
        .populate('senderId', 'name email role')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: list,
    });
};

const markReadController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Notification ID is required');
    }

    const notification = await Notification.findOneAndUpdate(
        { _id: id, recipientId: req.user.userId },
        { status: 'READ', readAt: Date.now() },
        { new: true },
    );

    if (!notification) {
        throw new ApiError(404, 'Notification not found');
    }

    res.status(200).json({
        success: true,
        message: 'Notification marked as read.',
        data: notification,
    });
};

const markAllReadController = async (req, res) => {
    await Notification.updateMany(
        { recipientId: req.user.userId, status: 'SENT' },
        { status: 'READ', readAt: Date.now() },
    );

    res.status(200).json({
        success: true,
        message: 'All notifications marked as read.',
    });
};

const deleteNotificationController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Notification ID is required');
    }

    const notification = await Notification.findOneAndDelete({
        _id: id,
        recipientId: req.user.userId,
    });

    if (!notification) {
        throw new ApiError(404, 'Notification not found');
    }

    res.status(200).json({
        success: true,
        message: 'Notification deleted from history successfully.',
    });
};

export {
    createTemplateController,
    getAllTemplatesController,
    deleteTemplateController,
    getPreferenceController,
    updatePreferenceController,
    sendNotificationController,
    getNotificationHistoryController,
    markReadController,
    markAllReadController,
    deleteNotificationController,
};
