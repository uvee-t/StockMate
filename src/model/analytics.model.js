import mongoose from 'mongoose';

const savedReportSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Report name is required'],
            trim: true,
        },
        reportType: {
            type: String,
            enum: ['INVENTORY', 'SALES', 'PURCHASE', 'WAREHOUSE'],
            required: [true, 'Report type is required'],
        },
        filters: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
    },
    { timestamps: true },
);

const reportHistorySchema = new mongoose.Schema(
    {
        savedReportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SavedReport',
            default: null,
        },
        reportType: {
            type: String,
            required: [true, 'Report type is required'],
        },
        generatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        parameters: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        summaryData: {
            type: mongoose.Schema.Types.Mixed,
            required: [true, 'Summary data is required'],
        },
    },
    { timestamps: true },
);

const SavedReport = mongoose.model('SavedReport', savedReportSchema);
const ReportHistory = mongoose.model('ReportHistory', reportHistorySchema);

export { SavedReport, ReportHistory };
