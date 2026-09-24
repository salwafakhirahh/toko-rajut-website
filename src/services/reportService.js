import { supabase } from './supabaseClient';

export const getSalesReport = async (period) => {
  let query = supabase.from('orders').select('*');

  if (period === 'daily') {
    const today = new Date().toISOString().split('T')[0];
    query = query.gte('created_at', today);
  } else if (period === 'monthly') {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    query = query.gte('created_at', startDate);
  }

  const { data, error } = await query;
  if (error) throw error;

  const totalSales = data.reduce((sum, order) => sum + order.total_amount, 0);
  const totalOrders = data.length;

  return { data, totalSales, totalOrders };
};

export const getTopProducts = async () => {
  const { data, error } = await supabase
    .from('order_items')
    .select('product_id, products(name, image_url), quantity')
    .order('quantity', { ascending: false })
    .limit(10);
  if (error) throw error;
  return data;
};

// Ambil semua order_items dengan relasi order dan kategori produk
export const getAllSalesItems = async () => {
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      id,
      order_id,
      product_id,
      product_name,
      quantity,
      price,
      subtotal,
      created_at,
      orders(order_number, status, created_at, customer_name, customer_phone, payment_method, delivery_method, delivery_address),
      products(category_id, categories(id, name, slug))
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// Ambil satu order lengkap dengan item
export const getOrderDetailById = async (orderId) => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  if (orderError) throw orderError;

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*, products(name, image_url)')
    .eq('order_id', orderId);
  if (itemsError) throw itemsError;

  return { order, items: items || [] };
};

// Ambil semua order untuk halaman transaksi admin
export const getAllOrdersWithItems = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};