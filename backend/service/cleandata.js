function cleanData(data) {
  return data.map((item) => {
    return {
      id: item.id || item._id, // Utiliser `id` ou `_id` comme fallback
      alt_description: item.alt_description || 'No description available', // Utiliser `alt_description` comme fallback
      url: item.urls?.regular, // Mapper `urls.regular` vers `url` pour correspondre au schéma
      description: item.description || item.alt_description || 'No description available', // Utiliser `description` ou `alt_description` comme fallback
      author: item.user?.name || 'Unknown author',
      created_at: item.created_at ? new Date(item.created_at) : new Date(),
      updated_at: item.updated_at ? new Date(item.updated_at) : new Date()
    };
  });
}

module.exports = cleanData;