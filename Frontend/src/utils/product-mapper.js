
const parseDetails = (detailsFromApi) => {
  if (!detailsFromApi || detailsFromApi.length === 0) {
    return [];
  }
  try {
    if (
      typeof detailsFromApi[0] === "string" &&
      detailsFromApi[0].startsWith("[")
    ) {
      return JSON.parse(detailsFromApi[0]);
    }
    return detailsFromApi;
  } catch (e) {
    console.error("Could not parse product details:", e);
    return Array.isArray(detailsFromApi) ? detailsFromApi : [];
  }
};


export const mapProductFromApi = (apiProduct) => {
  if (!apiProduct) return null;

  return {
    id: apiProduct.id,
    name: apiProduct.product_name,
    brand: apiProduct.attributes?.brand || "Brandless",
    price: apiProduct.price,
    category: apiProduct.category, 
    imageUrl: apiProduct.image_url,
    hoverImageUrl: apiProduct.hover_image_url,
    images: [
      apiProduct.image_url,
      ...(apiProduct.multi_images?.map((img) => img.image) || []),
    ].filter(Boolean),
    description: apiProduct.description,
    details: parseDetails(apiProduct.details),
    condition: apiProduct.condition,
    size: apiProduct.attributes?.size || "N/A",
    color: apiProduct.attributes?.color || "N/A",
    material: apiProduct.material,
    tags: apiProduct.tags || [],
    sellerNotes: apiProduct.seller_notes,

    _original: apiProduct,
  };
};
