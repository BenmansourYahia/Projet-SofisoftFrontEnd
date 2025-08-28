import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Sale | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

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

  const handleSort = (key: keyof Sale) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedSales = React.useMemo(() => {
    if (!sortConfig.key) return sales;

    return [...sales].sort((a, b) => {
      const aVal = a[sortConfig.key!];
      const bVal = b[sortConfig.key!];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [sales, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSales = sortedSales.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Reset page when sales change
  useEffect(() => {
    setCurrentPage(1);
  }, [sales]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in bg-black min-h-screen py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-white">Ventes</h1>
        <div className="mb-6 flex flex-wrap gap-4 items-center bg-zinc-900 p-4 rounded shadow">
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
            className="border border-zinc-700 rounded px-3 py-2 text-white bg-black focus:outline-none focus:ring-2 focus:ring-blue-400 dark:calendar-dark"
            value={debut}
            onChange={e => setDebut(e.target.value)}
            style={{ colorScheme: 'dark' }}
          />
          <input
            type="date"
            className="border border-zinc-700 rounded px-3 py-2 text-white bg-black focus:outline-none focus:ring-2 focus:ring-blue-400 dark:calendar-dark"
            value={fin}
            onChange={e => setFin(e.target.value)}
            style={{ colorScheme: 'dark' }}
          />
          <button
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded shadow font-semibold transition"
            onClick={() => {
              setDebut('2023-01-01');
              setFin('2023-12-31');
            }}
            style={{ minWidth: '100px' }}
          >
            Réinitialiser Dates
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded shadow font-semibold transition"
            onClick={fetchSales}
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Rechercher'}
          </button>
        </div>
        {error && <div className="text-red-500 mb-4 font-medium">{error}</div>}
        
        {sales.length === 0 && !loading ? (
          <div className="text-center text-zinc-400">Aucune vente trouvée</div>
        ) : (
          <>
            <div className="bg-zinc-900 rounded-lg shadow overflow-hidden border border-zinc-700">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-700 hover:bg-zinc-800">
                    <TableHead 
                      className="text-zinc-200 font-semibold cursor-pointer hover:text-white"
                      onClick={() => handleSort('designation')}
                    >
                      <div className="flex items-center gap-2">
                        Produit
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-zinc-200 font-semibold cursor-pointer hover:text-white"
                      onClick={() => handleSort('codeProduitGen')}
                    >
                      <div className="flex items-center gap-2">
                        Code Produit
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-zinc-200 font-semibold cursor-pointer hover:text-white"
                      onClick={() => handleSort('codeProduitDims')}
                    >
                      <div className="flex items-center gap-2">
                        Code Dims
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-zinc-200 font-semibold cursor-pointer hover:text-white"
                      onClick={() => handleSort('quantite')}
                    >
                      <div className="flex items-center gap-2">
                        Quantité
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-zinc-200 font-semibold cursor-pointer hover:text-white"
                      onClick={() => handleSort('prixVente')}
                    >
                      <div className="flex items-center gap-2">
                        Prix Vente
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-zinc-200 font-semibold cursor-pointer hover:text-white"
                      onClick={() => handleSort('total')}
                    >
                      <div className="flex items-center gap-2">
                        Total
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-zinc-200 font-semibold cursor-pointer hover:text-white"
                      onClick={() => handleSort('numProduit')}
                    >
                      <div className="flex items-center gap-2">
                        N° Produit
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSales.map((row, idx) => (
                    <TableRow key={idx} className="border-zinc-700 hover:bg-zinc-800 text-white">
                      <TableCell className="font-medium text-blue-400">{row.designation}</TableCell>
                      <TableCell className="text-zinc-300">{row.codeProduitGen}</TableCell>
                      <TableCell className="text-zinc-300">{row.codeProduitDims}</TableCell>
                      <TableCell className="text-center text-white font-medium">{row.quantite}</TableCell>
                      <TableCell className="text-right text-zinc-300">{row.prixVente} DH</TableCell>
                      <TableCell className="text-right font-semibold text-blue-200">{row.total} DH</TableCell>
                      <TableCell className="text-zinc-400">{row.numProduit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 bg-zinc-900 p-4 rounded border border-zinc-700">
                <div className="text-zinc-300 text-sm">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, sortedSales.length)} sur {sortedSales.length} ventes
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNumber)}
                          className={
                            currentPage === pageNumber
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                          }
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-zinc-300 text-sm">
                  Page {currentPage} sur {totalPages}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Sales;