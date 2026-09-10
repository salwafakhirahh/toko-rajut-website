import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name)')
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

  const { data, error } = await supabase
    .from('products')
    .insert([{
      name: productData.name,
      slug: slug,
      description: productData.description || '',
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
      category_id: productData.category_id,
      image_url: productData.image_url || null,
      discount: parseInt(productData.discount) || 0,
      is_promo: productData.is_promo || false,
    }])
    .select();
  if (error) throw error;
  return data[0];
};

export const updateProduct = async (id, productData) => {
  const { data, error } = await supabase
    .from('products')
    .update({
      name: productData.name,
      description: productData.description || '',
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
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