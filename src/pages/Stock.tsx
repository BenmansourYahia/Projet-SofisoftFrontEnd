import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { RefreshCw, Search, Barcode, Package } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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

  // Filter Table 1 by selected magasin only
  useEffect(() => {
    let filtered = allProducts;
    if (selectedMagasin !== 'all') {
      filtered = filtered.filter(p => p.magasin === selectedMagasin);
    }
    setFilteredProducts(filtered);
  }, [allProducts, selectedMagasin]);

  // Table 2: sorting and filtering
  let sortedGlobalStock = [...globalStock];
  if (sortOption === 'az') {
    sortedGlobalStock = sortedGlobalStock.sort((a, b) => a.designation.localeCompare(b.designation));
  } else if (sortOption === 'za') {
    sortedGlobalStock = sortedGlobalStock.sort((a, b) => b.designation.localeCompare(a.designation));
  } else if (sortOption === 'qtyAsc') {
    sortedGlobalStock = sortedGlobalStock.sort((a, b) => (a.quantite ?? 0) - (b.quantite ?? 0));
  } else if (sortOption === 'qtyDesc') {
    sortedGlobalStock = sortedGlobalStock.sort((a, b) => (b.quantite ?? 0) - (a.quantite ?? 0));
  }
  const filteredGlobalStock = sortedGlobalStock.filter(item =>
    item.designation?.toLowerCase().includes(search.toLowerCase()) ||
    item.codeProduit?.toLowerCase().includes(search.toLowerCase())
  );

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
            <CardTitle>Stock par Produit et Magasin</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center text-muted-foreground">Aucun résultat trouvé pour ce code-barres ou magasin.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.slice(0, 50).map((item, idx) => (
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
                    <div className="font-bold text-xl mb-1 text-blue-400 drop-shadow-lg tracking-wide">{item.designation}</div>
                    <div className="text-sm text-gray-300">Code Produit: <span className="font-semibold text-white drop-shadow">{item.codeProduit}</span></div>
                    <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-3 flex flex-col items-center border border-gray-700 shadow-md mt-2">
                      <span className="text-xs text-gray-400">Quantité en stock</span>
                      <span className="font-bold text-lg text-white drop-shadow">{item.quantite}</span>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-3 flex flex-col items-center border border-gray-700 shadow-md mt-2">
                      <span className="text-xs text-gray-400">Magasin</span>
                      <span className="font-bold text-lg text-blue-400 drop-shadow">{item.magasin}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table 2: Global Stock List */}
        <div className="flex items-center gap-4 mb-4">
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64"
            placeholder="Rechercher un produit, code ou magasin..."
          />
          <Select
            value={sortOption}
            onValueChange={value => setSortOption(value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Trier par..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="az">A-Z</SelectItem>
              <SelectItem value="za">Z-A</SelectItem>
              <SelectItem value="qtyAsc">Quantité croissante</SelectItem>
              <SelectItem value="qtyDesc">Quantité décroissante</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setSortOption('')} variant="secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réinitialiser Tri
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Liste Des Produits Actifs En Stock</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGlobalStock.map((item, idx) => (
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
                    <div className="font-bold text-xl mb-1 text-blue-400 drop-shadow-lg tracking-wide">{item.designation}</div>
                    <div className="text-sm text-gray-300">Code Produit: <span className="font-semibold text-white drop-shadow">{item.codeProduit}</span></div>
                    <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-3 flex flex-col items-center border border-gray-700 shadow-md mt-2">
                      <span className="text-xs text-gray-400">Quantité en stock</span>
                      <span className="font-bold text-lg text-white drop-shadow">{item.quantite}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Stock;