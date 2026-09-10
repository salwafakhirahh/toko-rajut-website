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