// Shared order utilities — expiry logic for valid_days field

export function isOrderExpired(order) {
  if (!order.valid_days || !order.created_date) return false;
  const createdDate = new Date(order.created_date);
  const expiryDate = new Date(createdDate.getTime() + order.valid_days * 24 * 60 * 60 * 1000);
  return new Date() > expiryDate;
}

export function getRemainingDays(order) {
  if (!order.valid_days || !order.created_date) return null;
  const createdDate = new Date(order.created_date);
  const expiryDate = new Date(createdDate.getTime() + order.valid_days * 24 * 60 * 60 * 1000);
  const diff = expiryDate - new Date();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}
