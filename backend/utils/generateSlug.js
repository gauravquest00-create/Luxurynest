const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove special chars
    .replace(/\s+/g, '-')       // replace spaces with hyphens
    .replace(/-+/g, '-');       // remove multiple hyphens
};

const ensureUniqueSlug = async (model, baseSlug, field = 'slug') => {
  let slug = baseSlug;
  let counter = 1;
  while (await model.findOne({ [field]: slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

export { generateSlug, ensureUniqueSlug };