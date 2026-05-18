import Advisor from '../models/Advisor.js';

export const getAllAdvisors = async (req, res) => {
  try {
    const advisors = await Advisor.find().select('-__v');
    res.json(advisors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdvisorById = async (req, res) => {
  try {
    const advisor = await Advisor.findById(req.params.id).select('-__v');
    if (!advisor) return res.status(404).json({ message: 'Advisor not found' });
    res.json(advisor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAdvisor = async (req, res) => {
  try {
    const advisor = new Advisor(req.body);
    await advisor.save();
    res.status(201).json(advisor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAdvisor = async (req, res) => {
  try {
    const advisor = await Advisor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!advisor) return res.status(404).json({ message: 'Advisor not found' });
    res.json(advisor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAdvisor = async (req, res) => {
  try {
    const advisor = await Advisor.findByIdAndDelete(req.params.id);
    if (!advisor) return res.status(404).json({ message: 'Advisor not found' });
    res.json({ message: 'Advisor deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};