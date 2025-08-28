import axios from 'axios';

// Configuration d'IP dynamique
const getServerIP = (): string => {
  return localStorage.getItem('serverIP') || '192.168.1.10';
};

const getServerPort = (): string => {
  return localStorage.getItem('serverPort') || '8080';
};

// Construire l'URL API dynamiquement
const getAPIBaseURL = (): string => {
  const ip = getServerIP();
  const port = getServerPort();
  return `http://${ip}:${port}`;
};

// Configure base API URL - mise à jour dynamique
let API_BASE_URL = getAPIBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fonction pour mettre à jour la configuration IP
export const updateServerConfig = (ip: string, port: string = '8080'): void => {
  localStorage.setItem('serverIP', ip);
  localStorage.setItem('serverPort', port);
  API_BASE_URL = `http://${ip}:${port}`;
  api.defaults.baseURL = API_BASE_URL;
};

// Fonction pour tester la connexion au serveur
export const testServerConnection = async (ip: string, port: string = '8080'): Promise<boolean> => {
  try {
    const testURL = `http://${ip}:${port}/api/health`; // endpoint de test
    const response = await axios.get(testURL, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    // Essayer un endpoint alternatif
    try {
      const testURL = `http://${ip}:${port}/actuator/health`;
      const response = await axios.get(testURL, { timeout: 5000 });
      return response.status === 200;
    } catch (altError) {
      return false;
    }
  }
};

// Fonction pour obtenir la configuration actuelle
export const getCurrentServerConfig = () => {
  return {
    ip: getServerIP(),
    port: getServerPort(),
    fullURL: getAPIBaseURL()
  };
};

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
  
  // Dashboard - Note: These are GET endpoints in backend
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

// Note: Dashboard endpoints (dashboardMagasins, evolutionCA) use GET method in backend
// and are correctly called with GET in frontend (api.get)