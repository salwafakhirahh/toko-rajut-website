const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN;

export const loginWithToken = (token) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (token === ADMIN_TOKEN) {
        localStorage.setItem('adminToken', token);
        resolve({ success: true });
      } else {
        reject({ success: false, message: 'Token tidak valid!' });
      }
    }, 1500);
  });
};

export const logout = () => {
  localStorage.removeItem('adminToken');
};

export const isAuthenticated = () => {
  return localStorage.getItem('adminToken') === ADMIN_TOKEN;
};

export const getAdminToken = () => {
  return localStorage.getItem('adminToken');
};