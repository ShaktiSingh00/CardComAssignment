const mongoose = require('mongoose');

const subTaskSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    title: { type: String, required: true },
    status: { type: Number, enum: [0, 1], default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('SubTask', subTaskSchema);
