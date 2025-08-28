import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { RefreshCw, Search, Barcode, Package, ChevronUp, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StockItem, Product } from '../types/api';

const Stock: React.FC = () => {
  const [globalStock, setGlobalStock] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<StockItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<StockItem[]>([]);
  const [selectedMagasin, setSelectedMagasin] = useState<string>('all');
  const [codeBarSearch, setCodeBarSearch] = useState('');
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [magasins, setMagasins] = useState<string[]>(['all']);
  const [sortOption, setSortOption] = useState(''); // Table 2 only
  
  // États pour le tri du tableau 1 (tri simple)
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // États pour la pagination du tableau 1
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(50);
  
  // États pour le tri et pagination du tableau 2
  const [sortField2, setSortField2] = useState<string>('');
  const [sortDirection2, setSortDirection2] = useState<'asc' | 'desc'>('asc');
  const [currentPage2, setCurrentPage2] = useState<number>(1);
  const [itemsPerPage2] = useState<number>(50);

  // Fetch global stock for Table 2
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8080/GlobalStock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 1, to: 214748364, stockBy: 1 })
    })
      .then(res => res.json())
      .then(data => {
        let produits: Product[] = [];
        try {
          const parsed = JSON.parse(data.data);
          produits = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          produits = [];
        }
        setGlobalStock(produits);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch all products for Table 1 on page load
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8080/StockByProduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isByBarcode: false })
    })
      .then(res => res.json())
      .then(data => {
        let produits: StockItem[] = [];
        try {
          const parsed = JSON.parse(JSON.parse(data.data).data);
          produits = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          produits = [];
        }
        setAllProducts(produits);
        setMagasins(['all', ...Array.from(new Set(produits.map(p => p.magasin).filter(Boolean)))]);
        setSelectedMagasin('all');
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch products for Table 1 by code bar search
  const fetchProductsByCodeBar = (codeBar: string) => {
    if (!codeBar.trim()) return;
    setLoading(true);
    fetch('http://localhost:8080/StockByProduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isByBarcode: true, barecode: codeBar })
    })
      .then(res => res.json())
      .then(data => {
        let produits: StockItem[] = [];
        try {
          const parsed = JSON.parse(JSON.parse(data.data).data);
          produits = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          produits = [];
        }
        setAllProducts(produits);
        setMagasins(['all', ...Array.from(new Set(produits.map(p => p.magasin).filter(Boolean)))]);
        setSelectedMagasin('all');
      })
      .finally(() => setLoading(false));
  };

  // Filter Table 1 by selected magasin and apply simple sorting
  useEffect(() => {
    let filtered = allProducts;
    if (selectedMagasin !== 'all') {
      filtered = filtered.filter(p => p.magasin === selectedMagasin);
    }
    
    // Appliquer le tri simple
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;
        
        switch (sortField) {
          case 'nom':
            aValue = a.designation?.toLowerCase() || '';
            bValue = b.designation?.toLowerCase() || '';
            break;
          case 'quantite':
            aValue = a.quantite || 0;
            bValue = b.quantite || 0;
            break;
          case 'statut':
            aValue = a.quantite < 0 ? -1 : (a.quantite === 0 ? 0 : 1); // -1 pour "Négatif", 0 pour "Vide", 1 pour "En Stock"
            bValue = b.quantite < 0 ? -1 : (b.quantite === 0 ? 0 : 1);
            break;
          case 'magasin':
            aValue = a.magasin?.toLowerCase() || '';
            bValue = b.magasin?.toLowerCase() || '';
            break;
          default:
            return 0;
        }
        
        if (typeof aValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue as string)
            : (bValue as string).localeCompare(aValue);
        } else {
          return sortDirection === 'asc' 
            ? (aValue as number) - (bValue as number)
            : (bValue as number) - (aValue as number);
        }
      });
    }
    
    setFilteredProducts(filtered);
  }, [allProducts, selectedMagasin, sortField, sortDirection]);

  // Fonction pour gérer le tri simple
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Si c'est le même champ, inverser la direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouveau champ, commencer par croissant
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Fonction pour réinitialiser le tri
  const resetSort = () => {
    setSortField('');
    setSortDirection('asc');
  };

  // Fonctions de pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredProducts.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1));

  // Réinitialiser la page lors du changement de filtre
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedMagasin, filteredProducts.length]);

  // Table 2: advanced sorting and filtering with pagination
  const getSortedGlobalStock = () => {
    let sorted = [...globalStock];
    
    // Appliquer le tri si un champ est sélectionné
    if (sortField2) {
      sorted = sorted.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;
        
        switch (sortField2) {
          case 'nom':
            aValue = a.designation?.toLowerCase() || '';
            bValue = b.designation?.toLowerCase() || '';
            break;
          case 'code':
            aValue = a.codeProduit?.toLowerCase() || '';
            bValue = b.codeProduit?.toLowerCase() || '';
            break;
          case 'quantite':
            aValue = a.quantite || 0;
            bValue = b.quantite || 0;
            break;
          case 'statut':
            aValue = a.quantite < 0 ? -1 : (a.quantite === 0 ? 0 : 1);
            bValue = b.quantite < 0 ? -1 : (b.quantite === 0 ? 0 : 1);
            break;
          default:
            return 0;
        }
        
        if (typeof aValue === 'string') {
          return sortDirection2 === 'asc' 
            ? aValue.localeCompare(bValue as string)
            : (bValue as string).localeCompare(aValue);
        } else {
          return sortDirection2 === 'asc' 
            ? (aValue as number) - (bValue as number)
            : (bValue as number) - (aValue as number);
        }
      });
    }
    
    return sorted;
  };
  
  const filteredGlobalStock = getSortedGlobalStock().filter(item =>
    item.designation?.toLowerCase().includes(search.toLowerCase()) ||
    item.codeProduit?.toLowerCase().includes(search.toLowerCase())
  );

  // Fonctions de tri pour tableau 2
  const handleSort2 = (field: string) => {
    if (sortField2 === field) {
      setSortDirection2(sortDirection2 === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField2(field);
      setSortDirection2('asc');
    }
  };

  const resetSort2 = () => {
    setSortField2('');
    setSortDirection2('asc');
  };

  // Pagination pour tableau 2
  const totalPages2 = Math.ceil(filteredGlobalStock.length / itemsPerPage2);
  const startIndex2 = (currentPage2 - 1) * itemsPerPage2;
  const endIndex2 = startIndex2 + itemsPerPage2;
  const currentItems2 = filteredGlobalStock.slice(startIndex2, endIndex2);

  const goToPage2 = (page: number) => {
    setCurrentPage2(Math.max(1, Math.min(page, totalPages2)));
  };

  const goToFirstPage2 = () => setCurrentPage2(1);
  const goToLastPage2 = () => setCurrentPage2(totalPages2);
  const goToPreviousPage2 = () => setCurrentPage2(Math.max(1, currentPage2 - 1));
  const goToNextPage2 = () => setCurrentPage2(Math.min(totalPages2, currentPage2 + 1));

  // Réinitialiser la page lors du changement de recherche
  React.useEffect(() => {
    setCurrentPage2(1);
  }, [search, filteredGlobalStock.length]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Stock Produits</h1>
            <p className="text-muted-foreground">Vue globale sur tous les produits dans le stock </p>
          </div>
        </div>

        {/* Magasin Selector, Code Bar Search, Sorting, and Search for Table 1 */}
        <div className="flex items-center gap-4 mb-4">
          <label className="font-medium">Liste Magasins</label>
          <Select value={selectedMagasin} onValueChange={setSelectedMagasin}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tous les magasins" />
            </SelectTrigger>
            <SelectContent>
              {magasins.map(magasin => (
                <SelectItem key={magasin} value={magasin}>{magasin === 'all' ? 'Tous les magasins' : magasin}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setSelectedMagasin('all')} variant="secondary">
            Réinitialiser Magasin
          </Button>
          <label className="font-medium">Rechercher par code-barres</label>
          <Input
            value={codeBarSearch}
            onChange={e => setCodeBarSearch(e.target.value)}
            className="w-40"
            placeholder="Code-barres..."
            onKeyDown={e => {
              if (e.key === 'Enter') fetchProductsByCodeBar(codeBarSearch);
            }}
          />
          <Button onClick={() => fetchProductsByCodeBar(codeBarSearch)} variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
          <Button onClick={() => {
            setCodeBarSearch('');
            setLoading(true);
            fetch('http://localhost:8080/StockByProduct', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isByBarcode: false })
            })
              .then(res => res.json())
              .then(data => {
                let produits: any[] = [];
                try {
                  const parsed = JSON.parse(JSON.parse(data.data).data);
                  produits = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                  produits = [];
                }
                setAllProducts(produits);
                setMagasins(['all', ...Array.from(new Set(produits.map(p => p.magasin).filter(Boolean)))]);
                // Do NOT reset magasin filter
              })
              .finally(() => setLoading(false));
          }} variant="secondary">
            Réinitialiser Code-barres
          </Button>
        </div>

        {/* Table 1: Magasin/CodeBar/Search/Sort Filtered Result */}
        <Card className="shadow-elegant border-primary border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Stock par Produit et Magasin ({filteredProducts.length} produits{totalPages > 1 ? ` - Page ${currentPage}/${totalPages}` : ''})
              </CardTitle>
              <div className="flex items-center gap-2">
                {sortField && (
                  <div className="text-xs text-muted-foreground">
                    Tri: {sortField} {sortDirection === 'asc' ? '↑' : '↓'}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSort}
                  disabled={!sortField}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Réinitialiser tri
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun résultat trouvé pour ce code-barres ou magasin.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="font-semibold cursor-pointer select-none hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('nom')}
                      >
                        <div className="flex items-center gap-2">
                          Nom du Produit
                          {sortField === 'nom' && (
                            sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="font-semibold cursor-pointer select-none hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('quantite')}
                      >
                        <div className="flex items-center gap-2">
                          Quantité
                          {sortField === 'quantite' && (
                            sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="font-semibold cursor-pointer select-none hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('statut')}
                      >
                        <div className="flex items-center gap-2">
                          Statut
                          {sortField === 'statut' && (
                            sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="font-semibold cursor-pointer select-none hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('magasin')}
                      >
                        <div className="flex items-center gap-2">
                          Magasin
                          {sortField === 'magasin' && (
                            sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((item, idx) => (
                      <TableRow key={startIndex + idx} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{item.designation}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {item.quantite}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.quantite < 0
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                              : item.quantite === 0 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {item.quantite < 0 ? 'Négatif' : (item.quantite === 0 ? 'Vide' : 'En Stock')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                            {item.magasin}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 p-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        Affichage de {startIndex + 1} à {Math.min(endIndex, filteredProducts.length)} sur {filteredProducts.length} produits
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToFirstPage}
                        disabled={currentPage === 1}
                      >
                        ««
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                      >
                        ‹ Précédent
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {(() => {
                          const maxVisiblePages = 5;
                          const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                          const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                          const adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1);
                          
                          const pageNumbers = [];
                          for (let i = adjustedStartPage; i <= endPage; i++) {
                            pageNumbers.push(i);
                          }
                          
                          return pageNumbers.map(pageNum => (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => goToPage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          ));
                        })()}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Suivant ›
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToLastPage}
                        disabled={currentPage === totalPages}
                      >
                        »»
                      </Button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} sur {totalPages}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table 2: Global Stock List */}
        <Card className="shadow-elegant border-primary border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Stock Global ({filteredGlobalStock.length} produits{totalPages2 > 1 ? ` - Page ${currentPage2}/${totalPages2}` : ''})
              </CardTitle>
              <div className="flex items-center gap-2">
                {sortField2 && (
                  <div className="text-xs text-muted-foreground">
                    Tri: {sortField2} {sortDirection2 === 'asc' ? '↑' : '↓'}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSort2}
                  disabled={!sortField2}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Réinitialiser tri
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtres */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un produit ou code..."
                  className="pl-10"
                />
              </div>
              <Button onClick={() => window.location.reload()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredGlobalStock.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun produit trouvé.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="font-semibold cursor-pointer select-none hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort2('nom')}
                      >
                        <div className="flex items-center gap-2">
                          Nom du Produit
                          {sortField2 === 'nom' && (
                            sortDirection2 === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="font-semibold cursor-pointer select-none hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort2('code')}
                      >
                        <div className="flex items-center gap-2">
                          Code Produit
                          {sortField2 === 'code' && (
                            sortDirection2 === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="font-semibold cursor-pointer select-none hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort2('quantite')}
                      >
                        <div className="flex items-center gap-2">
                          Quantité
                          {sortField2 === 'quantite' && (
                            sortDirection2 === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="font-semibold cursor-pointer select-none hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort2('statut')}
                      >
                        <div className="flex items-center gap-2">
                          Statut
                          {sortField2 === 'statut' && (
                            sortDirection2 === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems2.map((item, idx) => (
                      <TableRow key={startIndex2 + idx} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{item.designation}</TableCell>
                        <TableCell className="text-muted-foreground">{item.codeProduit || 'N/A'}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {item.quantite}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.quantite < 0
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                              : item.quantite === 0 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {item.quantite < 0 ? 'Négatif' : (item.quantite === 0 ? 'Vide' : 'En Stock')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Pagination Controls for Table 2 */}
                {totalPages2 > 1 && (
                  <div className="flex items-center justify-between mt-4 p-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        Affichage de {startIndex2 + 1} à {Math.min(endIndex2, filteredGlobalStock.length)} sur {filteredGlobalStock.length} produits
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToFirstPage2}
                        disabled={currentPage2 === 1}
                      >
                        ««
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousPage2}
                        disabled={currentPage2 === 1}
                      >
                        ‹ Précédent
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {(() => {
                          const maxVisiblePages = 5;
                          const startPage = Math.max(1, currentPage2 - Math.floor(maxVisiblePages / 2));
                          const endPage = Math.min(totalPages2, startPage + maxVisiblePages - 1);
                          const adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1);
                          
                          const pageNumbers = [];
                          for (let i = adjustedStartPage; i <= endPage; i++) {
                            pageNumbers.push(i);
                          }
                          
                          return pageNumbers.map(pageNum => (
                            <Button
                              key={pageNum}
                              variant={currentPage2 === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => goToPage2(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          ));
                        })()}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage2}
                        disabled={currentPage2 === totalPages2}
                      >
                        Suivant ›
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToLastPage2}
                        disabled={currentPage2 === totalPages2}
                      >
                        »»
                      </Button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage2} sur {totalPages2}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Stock;