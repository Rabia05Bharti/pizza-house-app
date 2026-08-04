import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchMenu = async (category = 'All', search = '') => {
  const response = await API.get('/menu', {
    params: { category, search }
  });
  return response.data;
};

export const fetchCategories = async () => {
  const response = await API.get('/menu/categories');
  return response.data;
};

export const createOrderApi = async (orderData) => {
  const response = await API.post('/orders', orderData);
  return response.data;
};

export const fetchOrdersApi = async () => {
  const response = await API.get('/orders');
  return response.data;
};

export const updateOrderStatusApi = async (id, statusData) => {
  const response = await API.patch(`/orders/${id}/status`, statusData);
  return response.data;
};

export const createRazorpayOrderApi = async (paymentData) => {
  const response = await API.post('/payment/create-order', paymentData);
  return response.data;
};

export const verifyPaymentApi = async (verificationData) => {
  const response = await API.post('/payment/verify', verificationData);
  return response.data;
};

export default API;
