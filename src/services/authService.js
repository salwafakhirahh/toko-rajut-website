import { supabase } from './supabaseClient';

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.warn('Logout warning:', error);
  }
};

export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};

export const getCurrentProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return null;
  return data;
};

export const isAuthenticated = async () => {
  const { data } = await supabase.auth.getSession();
  return !!data?.session;
};

export const isAdmin = async () => {
  const profile = await getCurrentProfile();
  return profile?.role === 'admin';
};

export const requireAdmin = async () => {
  const authenticated = await isAuthenticated();
  if (!authenticated) return false;
  return await isAdmin();
};