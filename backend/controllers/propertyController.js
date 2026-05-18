import Property from '../models/Property.js';
import Project from '../models/Project.js';
import { generateSlug, ensureUniqueSlug } from '../utils/generateSlug.js';

// ==================== GET all properties (public, with filters) ====================
// ==================== GET all properties (public, with filters) ====================
// ==================== GET all properties (public, with filters & pagination) ====================
export const getAllProperties = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, location, projectId, featured, page = 1, limit = 12, brand } = req.query;
    let filter = { liveStatus: 'active' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    if (type && type !== 'all') filter['unitDetails.type'] = type;
    if (projectId) filter.projectId = projectId;
    if (featured === 'true') filter.featured = true;
    if (minPrice || maxPrice) {
      filter['unitDetails.priceValue'] = {};
      if (minPrice) filter['unitDetails.priceValue'].$gte = parseInt(minPrice);
      if (maxPrice) filter['unitDetails.priceValue'].$lte = parseInt(maxPrice);
    }

    // Helper to apply location filter
    const locationFilter = (propertiesArray) => {
      if (!location) return propertiesArray;
      const lowerLoc = location.toLowerCase();
      return propertiesArray.filter(prop => {
        if (prop.area && prop.area.toLowerCase().includes(lowerLoc)) return true;
        const proj = prop.projectId;
        if (proj) {
          const addr = (proj.location?.address || '').toLowerCase();
          const sector = (proj.location?.sector || '').toLowerCase();
          const city = (proj.location?.city || '').toLowerCase();
          const projArea = (proj.area || '').toLowerCase();
          if (addr.includes(lowerLoc) || sector.includes(lowerLoc) || city.includes(lowerLoc) || projArea.includes(lowerLoc)) return true;
        }
        return false;
      });
    };

    // Helper to apply brand filter (project name)
    const brandFilter = (propertiesArray) => {
      if (!brand) return propertiesArray;
      const lowerBrand = brand.toLowerCase();
      return propertiesArray.filter(prop => {
        const proj = prop.projectId;
        return proj && proj.name && proj.name.toLowerCase().includes(lowerBrand);
      });
    };

    // Fetch all matching properties
    let allProperties = await Property.find(filter).populate('projectId', '-__v').select('-gatedInfo -__v');
    
    // Apply filters sequentially
    let filtered = locationFilter(allProperties);
    filtered = brandFilter(filtered);
    
    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limitNum);
    
    // For backwards compatibility: if no 'page' query, return array (old style)
    if (!req.query.page) {
      return res.json(paginated);
    }
    
    // Paginated response: object with properties array
    res.json({
      properties: paginated,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limitNum),
      total
    });
  } catch (error) {
    console.error('Error in getAllProperties:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== GET property by slug (public) ====================
// ==================== GET property by slug (public, with all needed fields) ====================
export const getPropertyBySlug = async (req, res) => {
  try {
    const property = await Property.findOne({ slug: req.params.slug, liveStatus: 'active' })
      .populate('projectId', '-__v')
      .select('-gatedInfo -__v');
    
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Prepare response with ALL fields that frontend needs
    const response = {
      property: {
        title: property.title,
        slug: property.slug,
        unitDetails: property.unitDetails,
        images: property.images,
        featured: property.featured,
        advisorId: property.advisorId,
        // ✅ Additional fields for area insights and property type detection
        area: property.area,
        propertyType: property.propertyType,
        description: property.description,
        societyName: property.societyName,
        buildingStructure: property.buildingStructure,
        availability: property.availability,
        gatedInfo: property.gatedInfo,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
        ownership: property.ownership,
        liveStatus: property.liveStatus
      },
      project: property.projectId,
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in getPropertyBySlug:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== CREATE property (admin, smart version) ====================
export const createProperty = async (req, res) => {
  try {
    // Parse the data string (sent as 'data' field from frontend)
    let propertyData;
    try {
      propertyData = JSON.parse(req.body.data);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid property data format' });
    }

    const {
      projectId,
      purpose,
      propertyType,
      unitDetails,
      availability,
      pricing,
      negotiation,
      location,
      title: providedTitle,
      slug: providedSlug,
      featured,
      liveStatus,
      societyName,
      area
    } = propertyData;

    // ========== VALIDATION: Apartment requires valid projectId ==========
    let project = null;
    if (propertyType === 'apartment') {
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required for apartment properties' });
      }
      project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
    } else {
      // For builderfloor or plot, projectId is optional
      if (projectId) {
        project = await Project.findById(projectId);
        if (!project) {
          return res.status(404).json({ error: 'Linked project not found (optional)' });
        }
      }
    }

    // 2. Generate title if not provided
    let title = providedTitle;
    if (!title) {
      if (propertyType === 'apartment' && project) {
        const bedrooms = unitDetails?.bedrooms || '';
        title = `${bedrooms} BHK${bedrooms ? ' ' : ''}Apartment in ${project.name} ${project.location?.sector || ''}`;
      } else if (propertyType === 'builderfloor') {
        const bedrooms = unitDetails?.bedrooms || '';
        title = `${bedrooms} Builder Floor in ${societyName || area || 'Independent'}`;
      } else if (propertyType === 'plot') {
        title = `Plot in ${area || 'Independent'}`;
      } else {
        title = 'Property';
      }
    }

    // 3. Generate slug
    let slug = providedSlug;
    if (!slug) {
      slug = `${title}-${Date.now()}`
        .toLowerCase()
        .replace(/[^\w\s-]+/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      // Ensure uniqueness
      const existing = await Property.findOne({ slug });
      if (existing) slug = `${slug}-${Date.now()}`;
    }

    // 4. Auto‑fill configuration from project (only for apartment)
    let bathrooms = unitDetails?.bathrooms;
    let balconies = unitDetails?.balconies;
    if (propertyType === 'apartment' && project && unitDetails?.bedrooms) {
      const config = project.configurations?.find(c => c.bedrooms == unitDetails.bedrooms);
      if (config) {
        if (!bathrooms) bathrooms = config.bathrooms;
        if (!balconies) balconies = config.balconies;
      }
    }

    // ========== 🔥 FIX: Type handling – respect frontend value ==========
    let finalType = unitDetails?.type;
    if (!finalType) {
      // fallback to old logic (no frontend value provided)
      if (propertyType === 'apartment') finalType = 'resale';
      else if (propertyType === 'builderfloor') finalType = 'floor';
      else if (propertyType === 'plot') finalType = 'plot';
      else finalType = 'resale';
    } else {
      // if frontend sent a type, validate it (optional but safe)
      const validTypes = ['resale', 'rent', 'floor', 'plot'];
      if (!validTypes.includes(finalType)) {
        finalType = propertyType === 'apartment' ? 'resale' : (propertyType === 'builderfloor' ? 'floor' : 'plot');
      }
    }

    // 5. Build final unitDetails object
    const finalUnitDetails = {
      ...unitDetails,
      bathrooms: bathrooms || unitDetails?.bathrooms,
      balconies: balconies || unitDetails?.balconies,
      type: finalType,   // ✅ Now respects frontend's 'rent' for rent properties
    };

    // 6. Build gatedInfo
    const gatedInfo = {
      exactPrice: negotiation?.exactPrice || pricing?.expectedPrice,
      negotiationInsights: negotiation?.isNegotiable ? 'Negotiable' : 'Fixed',
      availability: availability?.status || 'Immediate',
      sellerMotivation: '',
    };

    // 7. Images path
    const images = req.files ? req.files.map(file => `/uploads/properties/${file.filename}`) : [];

    // 8. Create property document
    const property = new Property({
      title,
      slug,
      projectId: projectId || null,
      unitDetails: finalUnitDetails,
      images,
      gatedInfo,
      featured: featured === true || featured === 'true',
      liveStatus: liveStatus === 'active' ? 'active' : 'inactive',
      propertyType,
      societyName: societyName || null,
      area: area || null,
      // Additional fields from frontend if needed
      purpose,
      location: location || (project ? project.location : null),
      availability,
      pricing,
    });

    await property.save();
    res.status(201).json(property);
  } catch (error) {
    console.error('Create property error:', error);
    res.status(400).json({ message: error.message });
  }
};

// ==================== UPDATE property (admin) ====================
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true, runValidators: true }
    );
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ==================== DELETE property (admin) ====================
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({ slug: req.params.slug });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json({ message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};