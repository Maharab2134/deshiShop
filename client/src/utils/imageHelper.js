// Helper function to get image URL from various formats
export const getImageUrl = (image) => {
  if (!image) return "";

  // If it's already a string URL
  if (typeof image === "string") return image;

  // If it's an object with url property
  if (image.url) return image.url;

  return "";
};

// Helper function to get first product image
export const getProductImage = (product) => {
  if (!product) return "";

  // Check if product has direct image property
  if (product.image) {
    return getImageUrl(product.image);
  }

  // Check if product has images array
  if (product.images && product.images.length > 0) {
    return getImageUrl(product.images[0]);
  }

  return "";
};

// Helper function to get category image
export const getCategoryImage = (category) => {
  if (!category) return "";

  if (category.image) {
    return getImageUrl(category.image);
  }

  return "";
};

// Helper function to get user avatar
export const getUserAvatar = (user) => {
  if (!user) return "";

  if (user.avatar) {
    return getImageUrl(user.avatar);
  }

  if (user.profileImage) {
    return getImageUrl(user.profileImage);
  }

  return "";
};
