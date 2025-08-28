// API Response Types based on backend documentation

export interface MyResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  exception?: string;
}

// Dashboard Models
export interface DashboardModel {
  magasinCode: string;
  magasinNom: string;
  ca: number;
  tickets: number;
  quantite: number;
  prixMoyen: number;
  panierMoyen: number;
  debitMoyen: number;
  tauxObjectif: number;
  periode: string;
}

export interface EvolutionCAModel {
  date: string;
  montant: number;
  magasinCode?: string;
}

// Store Models
export interface Magasin {
  code: string;
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  status?: string;
}

export interface MagasinInfo {
  code: string;
  nom: string;
  ca: number;
  tickets: number;
  quantite: number;
  prixMoyen: number;
  panierMoyen: number;
  dateDebut: string;
  dateFin: string;
}

// Comparison Models
export interface CompareResponse {
  magasins: MagasinInfo[];
  ecarts: any[];
  classement: any[];
}

export interface ComparePeriodeResponse {
  periodeActuelle: MagasinInfo;
  periodePrecedente: MagasinInfo;
  ecart: {
    ca: number;
    tickets: number;
    quantite: number;
  };
}

// Product Models
export interface Product {
  numProduit: number;
  designation: string;
  codeProduit: string;
  quantite: number;
}

export interface ProductDimension {
  codeProduit: string;
  codeBarres: string;
  taille?: string;
  couleur?: string;
  marque?: string;
  categorie?: string;
}

// Stock Models
export interface StockItem {
  numProduit: number;
  magasin: string;
  designation: string;
  quantite: number;
}

// Sales Models
export interface VenteInfo {
  date: string;
  ca: number;
  tickets: number;
  quantite: number;
  caComparaison?: number;
  ticketsComparaison?: number;
  quantiteComparaison?: number;
}

export interface LineVente {
  codeProduit: string;
  designation: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
  dateVente: string;
}

// User Models
export interface User {
  id: string;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  magasins: Magasin[];
  parametres?: any;
}

// API Request Models
export interface LoginRequest {
  username: string;
  password: string;
}

export interface DateRangeRequest {
  dateDebut: string;
  dateFin: string;
  magasinCode?: string;
}

export interface ProductRequest {
  codeProduit?: string;
  codeBarres?: string;
  magasinCode?: string;
}

export interface StockRequest {
  magasinCode?: string;
  stockFilter?: 'ALL' | 'POSITIVE' | 'ZERO' | 'NEGATIVE';
  withDimensions?: boolean;
}

export interface CompareStoresRequest {
  magasinCodes: string[];
  dateDebut: string;
  dateFin: string;
}