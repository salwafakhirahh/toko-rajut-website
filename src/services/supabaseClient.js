import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getProducts = async (includeInactive = false) => {
  let query = supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .order('created_at', { ascending: false });

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getAllProductsAdmin = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getProductById = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const addProduct = async (productData) => {
  const slug = productData.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');

  const stockValue = parseInt(productData.stock, 10);
  if (isNaN(stockValue) || stockValue < 0) {
    throw new Error('Stok harus berupa angka dan tidak boleh negatif');
  }

  const { data, error } = await supabase
    .from('products')
    .insert([{
      name: productData.name,
      slug: slug,
      description: productData.description || '',
      price: parseFloat(productData.price),
      stock: stockValue,
      category_id: productData.category_id,
      image_url: productData.image_url || null,
      discount: parseInt(productData.discount) || 0,
      is_promo: productData.is_promo || false,
      is_active: true,
    }])
    .select();
  if (error) throw error;
  return data[0];
};

export const updateProduct = async (id, productData) => {
  const stockValue = parseInt(productData.stock, 10);
  if (isNaN(stockValue) || stockValue < 0) {
    throw new Error('Stok harus berupa angka dan tidak boleh negatif');
  }

  const { data, error } = await supabase
    .from('products')
    .update({
      name: productData.name,
      description: productData.description || '',
      price: parseFloat(productData.price),
      stock: stockValue,
      category_id: productData.category_id,
      image_url: productData.image_url || null,
      discount: parseInt(productData.discount) || 0,
      is_promo: productData.is_promo || false,
      updated_at: new Date(),
    })
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
};

// Nonaktifkan produk (tidak muncul di katalog customer)
export const deactivateProduct = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .update({ is_active: false, updated_at: new Date() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Aktifkan kembali produk
export const activateProduct = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .update({ is_active: true, updated_at: new Date() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Hapus permanen, hanya untuk keperluan darurat
export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
};

export const addCategory = async (categoryData) => {
  const slug = categoryData.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');

  const { data, error } = await supabase
    .from('categories')
    .insert([{
      name: categoryData.name,
      slug: slug,
      description: categoryData.description || '',
    }])
    .select();
  if (error) throw error;
  return data[0];
};

export const updateCategory = async (id, categoryData) => {
  const { data, error } = await supabase
    .from('categories')
    .update({
      name: categoryData.name,
      description: categoryData.description || '',
    })
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteCategory = async (id) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// Hitung jumlah produk dalam kategori tertentu
export const countProductsByCategory = async (categoryId) => {
  const { count, error } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId);

  if (error) throw error;
  return count || 0;
};

export const getCart = async (userId) => {
  const { data, error } = await supabase
    .from('cart')
    .select('*, products(*)')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
};

export const addToCart = async (cartItem) => {
  const { data, error } = await supabase
    .from('cart')
    .insert([cartItem])
    .select();
  if (error) throw error;
  return data[0];
};

export const updateCartItem = async (id, quantity) => {
  const { data, error } = await supabase
    .from('cart')
    .update({ quantity })
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
};

export const removeFromCart = async (id) => {
  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

export const clearCart = async (userId) => {
  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
  return true;
};

export const createOrder = async (order) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select();
  if (error) throw error;
  return data[0];
};

export const getOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getOrdersByUser = async (userId) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getOrderItems = async (orderId) => {
  const { data, error } = await supabase
    .from('order_items')
    .select('*, products(*)')
    .eq('order_id', orderId);
  if (error) throw error;
  return data;
};

export const updateOrderStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
};

export const uploadProductImage = async (file) => {
  if (!file) throw new Error('File tidak ditemukan');

  const fileExt = file.name.split('.').pop();
  const fileName = `product-${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('products')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('products')
    .getPublicUrl(fileName);

  return publicUrl;
};

// REVIEW SERVICES
export const getProductReviews = async (productId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getProductRatingSummary = async (productId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId);
  if (error) throw error;
  if (!data || data.length === 0) {
    return { average: 0, count: 0 };
  }
  const total = data.reduce((sum, r) => sum + (r.rating || 0), 0);
  return {
    average: Number((total / data.length).toFixed(1)),
    count: data.length,
  };
};

export const addReview = async (reviewData) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert([reviewData])
    .select();
  if (error) throw error;
  return data[0];
};

export const updateReview = async (reviewId, { rating, review }) => {
  const { data, error } = await supabase
    .from('reviews')
    .update({ rating, review, updated_at: new Date() })
    .eq('id', reviewId)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteReview = async (reviewId) => {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);
  if (error) throw error;
  return true;
};

export const checkUserReview = async (userId, productId, orderId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .eq('order_id', orderId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const getMyReviewForProduct = async (userId, productId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const getUserReviews = async (userId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const canUserReviewProduct = async (userId, productId) => {
  const { data, error } = await supabase
    .from('orders')
    .select('id, status, order_items!inner(product_id)')
    .eq('user_id', userId)
    .eq('status', 'delivered')
    .eq('order_items.product_id', productId);
  if (error) throw error;
  return data && data.length > 0;
};

export const getDeliveredOrderIdForProduct = async (userId, productId) => {
  const { data, error } = await supabase
    .from('orders')
    .select('id, status, order_items!inner(product_id)')
    .eq('user_id', userId)
    .eq('status', 'delivered')
    .eq('order_items.product_id', productId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.id || null;
};

// USER SERVICES
export const getAllProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getCustomers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getAdmins = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'admin')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// ADDRESS SERVICES (Alamat Pengiriman)
export const getAddresses = async (userId) => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const addAddress = async (addressData) => {
  // Kalau ini alamat pertama, jadikan default
  const existing = await getAddresses(addressData.user_id);
  const shouldBeDefault = addressData.is_default || existing.length === 0;

  // Kalau alamat baru default, reset default yang lain
  if (shouldBeDefault && existing.length > 0) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', addressData.user_id);
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert([{
      user_id: addressData.user_id,
      label: addressData.label,
      recipient_name: addressData.recipient_name,
      phone: addressData.phone,
      address: addressData.address,
      is_default: shouldBeDefault,
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateAddress = async (id, addressData) => {
  const { data, error } = await supabase
    .from('addresses')
    .update({
      label: addressData.label,
      recipient_name: addressData.recipient_name,
      phone: addressData.phone,
      address: addressData.address,
      is_default: addressData.is_default,
      updated_at: new Date(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAddress = async (id) => {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

export const setDefaultAddress = async (userId, addressId) => {
  // Reset semua default milik user ini
  await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', userId);

  // Set default untuk alamat yang dipilih
  const { data, error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', addressId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// PICKUP CONTACT SERVICES (Kontak Pengambilan)
export const getPickupContacts = async (userId) => {
  const { data, error } = await supabase
    .from('pickup_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const addPickupContact = async (contactData) => {
  // Kalau ini kontak pertama, jadikan default
  const existing = await getPickupContacts(contactData.user_id);
  const shouldBeDefault = contactData.is_default || existing.length === 0;

  // Kalau kontak baru default, reset default yang lain
  if (shouldBeDefault && existing.length > 0) {
    await supabase
      .from('pickup_contacts')
      .update({ is_default: false })
      .eq('user_id', contactData.user_id);
  }

  const { data, error } = await supabase
    .from('pickup_contacts')
    .insert([{
      user_id: contactData.user_id,
      label: contactData.label,
      name: contactData.name,
      phone: contactData.phone,
      notes: contactData.notes || '',
      is_default: shouldBeDefault,
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updatePickupContact = async (id, contactData) => {
  const { data, error } = await supabase
    .from('pickup_contacts')
    .update({
      label: contactData.label,
      name: contactData.name,
      phone: contactData.phone,
      notes: contactData.notes || '',
      is_default: contactData.is_default,
      updated_at: new Date(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deletePickupContact = async (id) => {
  const { error } = await supabase
    .from('pickup_contacts')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

export const setDefaultPickupContact = async (userId, contactId) => {
  // Reset semua default milik user ini
  await supabase
    .from('pickup_contacts')
    .update({ is_default: false })
    .eq('user_id', userId);

  // Set default untuk kontak yang dipilih
  const { data, error } = await supabase
    .from('pickup_contacts')
    .update({ is_default: true })
    .eq('id', contactId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// STATISTIK PRODUK TERLARIS
export const getTopSellingProducts = async (limit = 10) => {
  const { data, error } = await supabase
    .from('order_items')
    .select('product_id, product_name, quantity, subtotal');

  if (error) throw error;
  if (!data || data.length === 0) return [];

  // Kelompokkan berdasarkan product_id
  const map = new Map();

  data.forEach((item) => {
    const key = item.product_id;
    if (!key) return;

    if (!map.has(key)) {
      map.set(key, {
        product_id: key,
        product_name: item.product_name,
        total_quantity: 0,
        total_revenue: 0,
      });
    }

    const entry = map.get(key);
    entry.total_quantity += Number(item.quantity || 0);
    entry.total_revenue += Number(item.subtotal || 0);
  });

  // Ubah ke array, urutkan berdasarkan quantity
  const sorted = Array.from(map.values()).sort(
    (a, b) => b.total_quantity - a.total_quantity
  );

  return sorted.slice(0, limit);
};