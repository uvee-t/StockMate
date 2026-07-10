import mongoose from 'mongoose';

const notificationTemplateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Template name is required'],
            unique: true,
            trim: true,
        },
        subject: {
            type: String,
            trim: true,
        },
        body: {
            type: String,
            required: [true, 'Template body content is required'],
        },
        channels: {
            type: [String],
            enum: ['EMAIL', 'SMS', 'IN_APP'],
            default: ['EMAIL', 'IN_APP'],
        },
    },
    { timestamps: true },
);

const notificationPreferenceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            unique: true,
        },
        channelsEnabled: {
            type: [String],
            enum: ['EMAIL', 'SMS', 'IN_APP'],
            default: ['EMAIL', 'IN_APP'],
        },
    },
    { timestamps: true },
);

const notificationSchema = new mongoose.Schema(
    {
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Recipient ID is required'],
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Sender ID is required'],
        },
        title: {
            type: String,
            required: [true, 'Notification title is required'],
            trim: true,
        },
        message: {
            type: String,
            required: [true, 'Notification message body is required'],
        },
        channel: {
            type: String,
            enum: ['EMAIL', 'SMS', 'IN_APP'],
            required: [true, 'Notification delivery channel is required'],
        },
        templateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'NotificationTemplate',
            default: null,
        },
        status: {
            type: String,
            enum: ['SENT', 'READ', 'FAILED'],
            default: 'SENT',
        },
        readAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true },
);

const NotificationTemplate = mongoose.model('NotificationTemplate', notificationTemplateSchema);
const NotificationPreference = mongoose.model(
    'NotificationPreference',
    notificationPreferenceSchema,
);
const Notification = mongoose.model('Notification', notificationSchema);

export { NotificationTemplate, NotificationPreference, Notification };
