import Property from '../models/Property.js';

export const matchProperties = async (req, res) => {
  try {
    let { purpose, propertyType, minBudget, maxBudget, bedrooms } = req.body;

    console.log('Match request:', { purpose, propertyType, minBudget, maxBudget, bedrooms });

    // Map frontend propertyType to actual unitDetails.type values
    let typeFilter = null;
    if (purpose === 'buy') {
      if (propertyType === 'apartment') typeFilter = 'resale';
      else if (propertyType === 'builderfloor') typeFilter = 'floor';
      else if (propertyType === 'plot') typeFilter = 'plot';
      else return res.status(400).json({ message: 'Invalid property type for buy' });
    } else if (purpose === 'rent') {
      if (propertyType === 'apartment') typeFilter = 'rent';
      else if (propertyType === 'builderfloor') typeFilter = 'floor';
      else return res.status(400).json({ message: 'Invalid property type for rent (plot not allowed)' });
    } else {
      return res.status(400).json({ message: 'Invalid purpose (must be buy or rent)' });
    }

    // Base filter: active properties with matching type
    let baseFilter = { liveStatus: 'active', 'unitDetails.type': typeFilter };
    let allProperties = await Property.find(baseFilter).populate('projectId').lean();
    console.log(`Total properties of type ${typeFilter}: ${allProperties.length}`);

    // Budget filter (using minBudget / maxBudget sent from frontend as numbers)
    let candidates = allProperties;
    if (minBudget !== undefined || maxBudget !== undefined) {
      const min = minBudget !== undefined ? minBudget : 0;
      const max = maxBudget !== undefined ? maxBudget : Infinity;
      candidates = allProperties.filter(p => {
        const price = p.unitDetails?.priceValue || 0;
        return price >= min && price <= max;
      });
      console.log(`After budget filter (${min} - ${max}): ${candidates.length}`);
    }

    // Bedrooms filter (optional)
    const bedNum = bedrooms ? parseFloat(bedrooms) : null;
    let exactBedroomMatches = candidates;
    if (bedNum && !isNaN(bedNum)) {
      exactBedroomMatches = candidates.filter(p => {
        const propBed = p.unitDetails?.bedrooms || 0;
        return Math.abs(propBed - bedNum) < 0.2; // tolerance for half BHK (2.5)
      });
      console.log(`After bedrooms filter (${bedNum}): ${exactBedroomMatches.length}`);
    }

    // Best matches = all budget + exact bedroom matches
    let bestMatches = exactBedroomMatches;
    let bufferMatches = [];

    if (bestMatches.length === 0) {
      // No exact bedroom matches – show all budget-matching properties as buffer
      bufferMatches = candidates;
    } else if (candidates.length > bestMatches.length) {
      // Show additional properties that are within budget but not exact bedroom matches
      bufferMatches = candidates.filter(p => !bestMatches.some(b => b._id === p._id)).slice(0, 6);
    }

    // Limit to 6 each
    const finalBest = bestMatches.slice(0, 6);
    const finalBuffer = bufferMatches.slice(0, 6);

    res.json({
      bestMatches: finalBest,
      bufferMatches: finalBuffer,
      meta: {
        totalFound: finalBest.length,
        message: finalBest.length === 0 ? 'No exact matches, showing recommended properties.' : ''
      }
    });
  } catch (error) {
    console.error('Match error:', error);
    res.status(500).json({ message: error.message });
  }
};