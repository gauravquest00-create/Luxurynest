import express from 'express';
import Area from '../models/Area.js';
import { protect, adminOnly } from '../middleware/auth.js'; // adjust path as needed

const router = express.Router();

// GET /api/areas (existing – supports name query)
router.get('/', async (req, res) => {
  try {
    const query = req.query;
    let areaName = null;

    if (query.name) {
      areaName = query.name;
    } else {
      const keys = Object.keys(query);
      if (keys.length > 0 && (query[keys[0]] === undefined || query[keys[0]] === '')) {
        areaName = decodeURIComponent(keys[0]);
      }
    }

    let dbQuery = { 'meta.active': true };
    if (areaName) {
      dbQuery.name = { $regex: new RegExp(`^${areaName}$`, 'i') };
    }
    const areas = await Area.find(dbQuery);
    res.json(areas);
  } catch (error) {
    console.error('Error fetching areas:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET single area by ID (existing)
router.get('/:id', async (req, res) => {
  try {
    const area = await Area.findById(req.params.id);
    if (!area) return res.status(404).json({ message: 'Area not found' });
    res.json(area);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update area (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const updateData = req.body;
    // Sanitize: remove _id and __v if present
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const updatedArea = await Area.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedArea) return res.status(404).json({ message: 'Area not found' });
    res.json(updatedArea);
  } catch (error) {
    console.error('Error updating area:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;