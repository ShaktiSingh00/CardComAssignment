const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const SubTask = require('../models/SubTask');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);

// Create Task
router.post('/', async (req, res) => {
    const { title, description, dueDate, priority } = req.body;
    try {
        const task = new Task({
            userId: req.user.userId,
            title,
            description,
            dueDate,
            priority,
        });
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ message: 'Error creating task', error: err.message });
    }
});

// Get Tasks with Filters and Pagination
router.get('/', async (req, res) => {
    const { priority, dueDate, page = 1, limit = 10 } = req.query;
    const filters = { userId: req.user.userId, isDeleted: false };

    if (priority) filters.priority = priority;
    if (dueDate) filters.dueDate = { $lte: new Date(dueDate) };

    try {
        const tasks = await Task.find(filters)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching tasks', error: err.message });
    }
});

// Update Task
router.put('/:id', async (req, res) => {
    const { dueDate, status } = req.body;
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { dueDate, status },
            { new: true }
        );

        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Update subtasks if task is marked deleted
        if (status === 'DONE') {
            await SubTask.updateMany({ taskId: task._id }, { status: 1 });
        }

        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({ message: 'Error updating task', error: err.message });
    }
});

// Soft Delete Task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { isDeleted: true },
            { new: true }
        );

        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Soft delete associated subtasks
        await SubTask.updateMany({ taskId: task._id }, { isDeleted: true });

        res.status(200).json({ message: 'Task deleted successfully', task });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting task', error: err.message });
    }
});

module.exports = router;
