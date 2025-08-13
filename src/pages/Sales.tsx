import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface Magasin {
  numMagasin: number;
  nomMagasin: string;
}

interface Sale {
  numMagasin: number;
  codeProduitDims: string;
  codeProduitGen: string;
  designation: string;
  quantite: number;
  prixVente: number;
  total: number;
  numProduit: number;
}

const Sales: React.FC = () => {
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [numMagasin, setNumMagasin] = useState<number | null>(null);
  // Fetch magasins for dropdown
  useEffect(() => {
    async function fetchMagasins() {
      try {
        const response = await axios.post('http://localhost:8080/getMagasins');
        if (response.data.success && response.data.data) {
          let parsedData: Magasin[] = response.data.data;
          if (typeof parsedData === 'string') {
            try {
              parsedData = JSON.parse(parsedData);
            } catch (e) {
              parsedData = [];
            }
          }
          setMagasins(parsedData);
          if (parsedData.length > 0) {
            setNumMagasin(parsedData[0].numMagasin);
          }
        }
      } catch (err) {
        setMagasins([]);
      }
    }
    fetchMagasins();
  }, []);
  const [debut, setDebut] = useState('2023-01-01');
  const [fin, setFin] = useState('2023-12-31');
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortTotal, setSortTotal] = useState<'asc' | 'desc' | ''>('');

  function formatDate(dateStr: string, isStart: boolean) {
    // Convert YYYY-MM-DD to DD-MM-YYYY
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year} ${isStart ? '00:00:00' : '23:59:59'}`;
  }

  const fetchSales = async () => {
    setLoading(true);
    setError('');
    try {
      if (!numMagasin) {
        setSales([]);
        setError('Veuillez sélectionner un magasin');
        setLoading(false);
        return;
      }
      const response = await axios.post('http://localhost:8080/getPrdsVendus', {
        numMagasin,
        debut: formatDate(debut, true),
        fin: formatDate(fin, false),
      });
      if (response.data.success && response.data.data) {
        let parsedData: Sale[] = response.data.data;
        if (typeof parsedData === 'string') {
          try {
            parsedData = JSON.parse(parsedData);
          } catch (e) {
            parsedData = [];
          }
        }
        setSales(parsedData);
      } else {
        setSales([]);
        setError('Aucune donnée trouvée');
      }
    } catch (e) {
      setError('Erreur lors du chargement des ventes');
      setSales([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in bg-black min-h-screen py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-white">Ventes</h1>
        <div className="mb-6 flex flex-wrap gap-4 items-center bg-zinc-900 p-4 rounded shadow">
          <div className="flex gap-2 items-center">
            <label className="text-white font-semibold">Total:</label>
            <select
              className="border border-zinc-700 rounded px-2 py-1 text-white bg-black"
              value={sortTotal}
              onChange={e => setSortTotal(e.target.value as 'asc' | 'desc' | '')}
            >
              <option value="">-- Aucun --</option>
              <option value="asc">Croissant</option>
              <option value="desc">Décroissant</option>
            </select>
            <button
              className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded shadow font-semibold transition ml-2"
              onClick={() => setSortTotal('')}
              disabled={sortTotal === ''}
            >
              Réinitialiser 
            </button>
          </div>
          <select
            className="border border-zinc-700 rounded px-3 py-2 text-white bg-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={numMagasin ?? ''}
            onChange={e => setNumMagasin(Number(e.target.value))}
          >
            <option value="" disabled className="text-white bg-black">Sélectionner un magasin</option>
            {magasins.map((magasin) => (
              <option key={magasin.numMagasin} value={magasin.numMagasin} className="text-white bg-black">
                {magasin.nomMagasin}
              </option>
            ))}
          </select>
          <button
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded shadow font-semibold transition"
            onClick={() => {
              if (magasins.length > 0) setNumMagasin(magasins[0].numMagasin);
            }}
            disabled={magasins.length === 0}
            style={{ minWidth: '100px' }}
          >
            Réinitialiser 
          </button>
          <input
            type="date"
            className="border border-zinc-700 rounded px-3 py-2 text-white bg-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={debut}
            onChange={e => setDebut(e.target.value)}
          />
          <input
            type="date"
            className="border border-zinc-700 rounded px-3 py-2 text-white bg-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={fin}
            onChange={e => setFin(e.target.value)}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded shadow font-semibold transition"
            onClick={fetchSales}
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Rechercher'}
          </button>
        </div>
        {error && <div className="text-red-500 mb-4 font-medium">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sales.length === 0 && !loading ? (
            <div className="col-span-full text-center text-zinc-400">Aucune vente trouvée</div>
          ) : (
            [...sales]
              .sort((a, b) => {
                if (sortTotal === 'asc') return a.total - b.total;
                if (sortTotal === 'desc') return b.total - a.total;
                return 0;
              })
              .map((row, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-black via-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 flex flex-col gap-3 shadow-2xl hover:shadow-blue-900 transition duration-300 relative"
                  style={{
                    boxShadow:
                      '0 6px 32px 0 rgba(0,0,0,0.85), 0 2px 12px 0 rgba(30,64,175,0.18)',
                    border: '2px solid #23272f',
                    overflow: 'hidden',
                  }}
                >
                  <div className="absolute top-0 right-0 h-16 w-16 bg-blue-900 opacity-20 rounded-bl-2xl blur-xl pointer-events-none" />
                  <div className="font-bold text-xl mb-1 text-blue-400 drop-shadow-lg tracking-wide">{row.designation}</div>
                  <div className="text-sm text-gray-300">Code Produit: <span className="font-semibold text-white drop-shadow">{row.codeProduitGen}</span></div>
                  <div className="text-sm text-gray-300">Code Dims: <span className="font-semibold text-white drop-shadow">{row.codeProduitDims}</span></div>
                  <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-3 flex flex-col items-center border border-gray-700 shadow-md mt-2">
                    <span className="text-xs text-gray-400">Quantité vendue</span>
                    <span className="font-bold text-lg text-white drop-shadow">{row.quantite}</span>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-3 flex flex-col items-center border border-gray-700 shadow-md mt-2">
                    <span className="text-xs text-gray-400">Prix Vente</span>
                    <span className="font-bold text-lg text-blue-400 drop-shadow">{row.prixVente} DH</span>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-3 flex flex-col items-center border border-gray-700 shadow-md mt-2">
                    <span className="text-xs text-gray-400">Total</span>
                    <span className="font-bold text-lg text-blue-200 drop-shadow">{row.total} DH</span>
                  </div>
                  <div className="text-xs text-gray-200 bg-gray-800 rounded px-3 py-1 shadow mt-3">Numéro Produit: {row.numProduit}</div>
                </div>
              ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Sales;