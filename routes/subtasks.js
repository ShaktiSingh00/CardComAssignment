const express = require('express');
const router = express.Router();
const SubTask = require('../models/SubTask');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);

// Create Subtask
router.post('/', async (req, res) => {
    const { taskId, title } = req.body;
    try {
        const subTask = new SubTask({ taskId, title });
        await subTask.save();
        res.status(201).json(subTask);
    } catch (err) {
        res.status(500).json({ message: 'Error creating subtask', error: err.message });
    }
});

// Update Subtask Status
router.put('/:id', async (req, res) => {
    const { status } = req.body;
    try {
        const subTask = await SubTask.findOneAndUpdate(
            { _id: req.params.id },
            { status },
            { new: true }
        );

        if (!subTask) return res.status(404).json({ message: 'Subtask not found' });

        res.status(200).json(subTask);
    } catch (err) {
        res.status(500).json({ message: 'Error updating subtask', error: err.message });
    }
});

// Soft Delete Subtask
router.delete('/:id', async (req, res) => {
    try {
        const subTask = await SubTask.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true }
        );

        if (!subTask) return res.status(404).json({ message: 'Subtask not found' });

        res.status(200).json({ message: 'Subtask deleted successfully', subTask });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting subtask', error: err.message });
    }
});

module.exports = router;
