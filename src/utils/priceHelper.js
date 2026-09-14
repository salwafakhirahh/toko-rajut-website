export const calculateFinalPrice = (product) => {
  if (!product) return 0;
  const price = product.price || 0;
  const discount = product.discount || 0;
  return price - (price * discount / 100);
};

export const calculateSubtotal = (product, quantity) => {
  const finalPrice = calculateFinalPrice(product);
  return finalPrice * quantity;
};

export const getDiscountAmount = (product) => {
  if (!product) return 0;
  const price = product.price || 0;
  const discount = product.discount || 0;
  return price * discount / 100;
};