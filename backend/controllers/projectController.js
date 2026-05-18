import Project from '../models/Project.js';
import { generateSlug, ensureUniqueSlug } from '../utils/generateSlug.js';

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ liveStatus: 'active' }).select('-__v');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    console.log("🔍 Searching for project with slug:", slug);

    const project = await Project.findOne({ slug });
    console.log("📦 Project found:", project ? project.name : "None");

    // 🔥 DEBUG: Log connectivity and landmarks
    // console.log("🔗 Connectivity from DB:", project?.connectivity);
    // console.log("📍 Landmarks from DB:", project?.landmarks);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error("❌ Error in getProjectBySlug:", error);
    res.status(500).json({ message: error.message });
  }
};
export const createProject = async (req, res) => {
  try {
    const baseSlug = generateSlug(req.body.name);
    const slug = await ensureUniqueSlug(Project, baseSlug);
    const project = new Project({ ...req.body, slug });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findByIdAndDelete(id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const bulkDeleteProjects = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !ids.length) {
            return res.status(400).json({ success: false, message: 'No project IDs provided' });
        }
        const result = await Project.deleteMany({ _id: { $in: ids } });
        res.json({ 
            success: true, 
            message: `${result.deletedCount} project(s) deleted successfully`,
            deletedCount: result.deletedCount 
        });
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get distinct project names for brands section
export const getProjectNames = async (req, res) => {
  try {
    // Fetch only active projects, get their names
    const projects = await Project.find({ liveStatus: 'active' }).select('name');
    const names = projects.map(p => p.name);
    const uniqueNames = [...new Set(names)]; // remove duplicates
    res.json(uniqueNames);
  } catch (error) {
    console.error('Error fetching project names:', error);
    res.status(500).json({ message: error.message });
  }
};