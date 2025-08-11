import axios from 'axios';

// Configure base API URL - update this to your backend URL
const API_BASE_URL = 'http://localhost:8080'; // Change this to your actual backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const endpoints = {
  // Authentication
  login: '/Login',
  
  // Dashboard
  dashboardMagasins: '/dashboardMagasins',
  evolutionCA: '/evolutionCA',
  
  // Stores
  getMagasins: '/getMagasins',
  getMagasinsInfoByDate: '/getMagasinsInfoByDate',
  getMagasinsInfos: '/getMagasinsInfos',
  compareMagasins: '/compareMagasins',
  
  // Sales
  bestSalesPrds: '/bestSalesPrds',
  getLineVentes: '/getLineVentes',
  getPrdsVendus: '/getPrdsVendus',
  getDimsPrdVendus: '/getDimsPrdVendus',
  getInfosByDate: '/getInfosByDate',
  getInfosDay: '/getInfosDay',
  getComparePeriode: '/getComparePeriode',
  
  // Stock
  stockByProduct: '/StockByProduct',
  globalStock: '/GlobalStock',
  
  // Utils
  getParam: '/getParam',
  getDims: '/getDims',
};