import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Barcode,
  Euro,
  Hash
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import api, { endpoints } from '@/lib/api';
import { MyResponse, StockItem, ProductDimension } from '@/types/api';

export const Stock: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [globalStock, setGlobalStock] = useState<StockItem[]>([]);
  const [productStock, setProductStock] = useState<StockItem | null>(null);
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'POSITIVE' | 'ZERO' | 'NEGATIVE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchGlobalStock = async () => {
    setLoading(true);
    try {
      const response = await api.post<MyResponse<StockItem[]>>(endpoints.globalStock, {
        magasinCode: selectedStore === 'all' ? undefined : selectedStore,
        stockFilter,
        withDimensions: true
      });

      if (response.data.success) {
        setGlobalStock(response.data.data);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le stock global',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const searchProductStock = async () => {
    if (!searchProduct.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await api.post<MyResponse<StockItem>>(endpoints.stockByProduct, {
        codeProduit: searchProduct,
        codeBarres: searchProduct,
        magasinCode: selectedStore === 'all' ? undefined : selectedStore
      });

      if (response.data.success) {
        setProductStock(response.data.data);
      } else {
        toast({
          title: 'Produit non trouvé',
          description: 'Aucun produit trouvé avec ce code/code-barres',
          variant: 'destructive',
        });
        setProductStock(null);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la recherche du produit',
        variant: 'destructive',
      });
      setProductStock(null);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (user?.magasins?.length) {
      setSelectedStore(user.magasins[0].code);
    }
  }, [user]);

  useEffect(() => {
    fetchGlobalStock();
  }, [selectedStore, stockFilter]);

  // Filter stock data based on search query
  const filteredStock = globalStock.filter(item =>
    item.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.codeProduit.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.codeBarres.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockStatus = (quantity: number) => {
    if (quantity > 10) return { status: 'En stock', variant: 'default' as const, icon: CheckCircle };
    if (quantity > 0) return { status: 'Stock faible', variant: 'secondary' as const, icon: AlertTriangle };
    return { status: 'Rupture', variant: 'destructive' as const, icon: XCircle };
  };

  const totalStockValue = filteredStock.reduce((sum, item) => sum + item.valeurStock, 0);
  const totalQuantity = filteredStock.reduce((sum, item) => sum + item.quantiteStock, 0);
  const lowStockItems = filteredStock.filter(item => item.quantiteStock > 0 && item.quantiteStock <= 10).length;
  const outOfStockItems = filteredStock.filter(item => item.quantiteStock === 0).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion des Stocks</h1>
            <p className="text-muted-foreground">
              Suivi et analyse des stocks de vos magasins
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sélectionner un magasin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les magasins</SelectItem>
                {user?.magasins?.map((magasin) => (
                  <SelectItem key={magasin.code} value={magasin.code}>
                    {magasin.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchGlobalStock} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Stock Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valeur Totale</p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalStockValue.toLocaleString()}€
                  </p>
                </div>
                <Euro className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quantité Totale</p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalQuantity.toLocaleString()}
                  </p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stock Faible</p>
                  <p className="text-2xl font-bold text-warning">
                    {lowStockItems}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ruptures</p>
                  <p className="text-2xl font-bold text-danger">
                    {outOfStockItems}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-danger" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Management Tabs */}
        <Tabs defaultValue="global" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="global">Stock Global</TabsTrigger>
            <TabsTrigger value="search">Recherche Produit</TabsTrigger>
          </TabsList>

          {/* Global Stock Tab */}
          <TabsContent value="global" className="space-y-6">
            {/* Filters */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filtres</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="search">Rechercher</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Nom, code produit ou code-barres..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>Statut Stock</Label>
                  <Select value={stockFilter} onValueChange={(value: any) => setStockFilter(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tous</SelectItem>
                      <SelectItem value="POSITIVE">En stock</SelectItem>
                      <SelectItem value="ZERO">Rupture</SelectItem>
                      <SelectItem value="NEGATIVE">Négatif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Stock List */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Liste des Produits</CardTitle>
                <CardDescription>
                  {filteredStock.length} produits trouvés
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredStock.map((item) => {
                      const { status, variant, icon: StatusIcon } = getStockStatus(item.quantiteStock);
                      
                      return (
                        <div key={`${item.codeProduit}-${item.magasinCode}`} className="p-4 rounded-lg border border-border bg-card/50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <Package className="h-5 w-5 text-primary" />
                                <h4 className="font-semibold text-foreground">{item.designation}</h4>
                                <Badge variant={variant}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {status}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                                <span className="flex items-center space-x-1">
                                  <Hash className="h-3 w-3" />
                                  <span>{item.codeProduit}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Barcode className="h-3 w-3" />
                                  <span>{item.codeBarres}</span>
                                </span>
                                {item.magasinCode && (
                                  <span className="flex items-center space-x-1">
                                    <Package className="h-3 w-3" />
                                    <span>{item.magasinCode}</span>
                                  </span>
                                )}
                              </div>

                              {item.dimensions && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  {item.dimensions.taille && `Taille: ${item.dimensions.taille} • `}
                                  {item.dimensions.couleur && `Couleur: ${item.dimensions.couleur} • `}
                                  {item.dimensions.marque && `Marque: ${item.dimensions.marque}`}
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <p className="text-2xl font-bold text-foreground">
                                {item.quantiteStock}
                              </p>
                              <p className="text-sm text-muted-foreground">unités</p>
                              <p className="text-lg font-semibold text-primary mt-1">
                                {item.valeurStock.toLocaleString()}€
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Recherche Produit Spécifique</span>
                </CardTitle>
                <CardDescription>
                  Rechercher un produit par son code produit ou code-barres
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="productSearch">Code Produit ou Code-Barres</Label>
                    <Input
                      id="productSearch"
                      placeholder="Saisissez le code produit ou code-barres..."
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchProductStock()}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={searchProductStock} 
                      disabled={searchLoading || !searchProduct.trim()}
                    >
                      {searchLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {productStock && (
                  <div className="mt-6 p-6 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {productStock.designation}
                        </h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Code Produit</p>
                            <p className="font-semibold">{productStock.codeProduit}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Code-Barres</p>
                            <p className="font-semibold">{productStock.codeBarres}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Magasin</p>
                            <p className="font-semibold">{productStock.magasinCode}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Statut</p>
                            <Badge variant={getStockStatus(productStock.quantiteStock).variant}>
                              {getStockStatus(productStock.quantiteStock).status}
                            </Badge>
                          </div>
                        </div>

                        {productStock.dimensions && (
                          <div className="mb-4">
                            <p className="text-sm text-muted-foreground mb-2">Caractéristiques</p>
                            <div className="flex flex-wrap gap-2">
                              {productStock.dimensions.taille && (
                                <Badge variant="outline">Taille: {productStock.dimensions.taille}</Badge>
                              )}
                              {productStock.dimensions.couleur && (
                                <Badge variant="outline">Couleur: {productStock.dimensions.couleur}</Badge>
                              )}
                              {productStock.dimensions.marque && (
                                <Badge variant="outline">Marque: {productStock.dimensions.marque}</Badge>
                              )}
                              {productStock.dimensions.categorie && (
                                <Badge variant="outline">Catégorie: {productStock.dimensions.categorie}</Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right ml-6">
                        <p className="text-3xl font-bold text-foreground">
                          {productStock.quantiteStock}
                        </p>
                        <p className="text-sm text-muted-foreground">unités en stock</p>
                        <p className="text-xl font-semibold text-primary mt-2">
                          {productStock.valeurStock.toLocaleString()}€
                        </p>
                        <p className="text-sm text-muted-foreground">valeur totale</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Stock;