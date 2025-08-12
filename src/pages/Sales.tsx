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
  TrendingUp, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Calendar,
  Search,
  RefreshCw,
  DollarSign,
  Hash,
  Clock,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import api, { endpoints } from '@/lib/api';
import { MyResponse, Product, LineVente, VenteInfo, ProductDimension } from '@/types/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

export const Sales: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [salesLines, setSalesLines] = useState<LineVente[]>([]);
  const [soldProducts, setSoldProducts] = useState<Product[]>([]);
  const [dailySales, setDailySales] = useState<VenteInfo[]>([]);
  const [hourlySales, setHourlySales] = useState<VenteInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBestSellers = async () => {
    if (!selectedStore || selectedStore === 'all') return;
    
    try {
      const response = await api.post<MyResponse<Product[]>>(endpoints.bestSalesPrds, {
        magasinCode: selectedStore,
        dateDebut: format(dateRange.from, 'yyyy-MM-dd'),
        dateFin: format(dateRange.to, 'yyyy-MM-dd')
      });

      if (response.data.success) {
        setBestSellers(response.data.data);
      }
    } catch (error: any) {
      console.error('Best Sellers API Error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les meilleurs vendeurs',
        variant: 'destructive',
      });
    }
  };

  const fetchSalesLines = async () => {
    if (!selectedStore || selectedStore === 'all') return;
    
    try {
      const response = await api.post<MyResponse<LineVente[]>>(endpoints.getLineVentes, {
        magasinCode: selectedStore,
        dateDebut: format(dateRange.from, 'yyyy-MM-dd'),
        dateFin: format(dateRange.to, 'yyyy-MM-dd')
      });

      if (response.data.success) {
        setSalesLines(response.data.data);
      }
    } catch (error: any) {
      console.error('Sales Lines API Error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les lignes de vente',
        variant: 'destructive',
      });
    }
  };

  const fetchSoldProducts = async () => {
    if (!selectedStore || selectedStore === 'all') return;
    
    try {
      const response = await api.post<MyResponse<Product[]>>(endpoints.getPrdsVendus, {
        magasinCode: selectedStore,
        dateDebut: format(dateRange.from, 'yyyy-MM-dd'),
        dateFin: format(dateRange.to, 'yyyy-MM-dd')
      });

      if (response.data.success) {
        setSoldProducts(response.data.data);
      }
    } catch (error: any) {
      console.error('Sold Products API Error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les produits vendus',
        variant: 'destructive',
      });
    }
  };

  const fetchDailySales = async () => {
    if (!selectedStore || selectedStore === 'all') return;
    
    try {
      const response = await api.post<MyResponse<VenteInfo[]>>(endpoints.getInfosByDate, {
        magasinCode: selectedStore,
        dateDebut: format(dateRange.from, 'yyyy-MM-dd'),
        dateFin: format(dateRange.to, 'yyyy-MM-dd')
      });

      if (response.data.success) {
        setDailySales(response.data.data);
      }
    } catch (error: any) {
      console.error('Daily Sales API Error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les ventes quotidiennes',
        variant: 'destructive',
      });
    }
  };

  const fetchHourlySales = async () => {
    if (!selectedStore || selectedStore === 'all') return;
    
    try {
      const response = await api.post<MyResponse<VenteInfo[]>>(endpoints.getInfosDay, {
        magasinCode: selectedStore,
        date: format(dateRange.from, 'yyyy-MM-dd')
      });

      if (response.data.success) {
        setHourlySales(response.data.data);
      }
    } catch (error: any) {
      console.error('Hourly Sales API Error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les ventes horaires',
        variant: 'destructive',
      });
    }
  };

  const fetchAllSalesData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBestSellers(),
        fetchSalesLines(),
        fetchSoldProducts(),
        fetchDailySales(),
        fetchHourlySales()
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.magasins?.length) {
      setSelectedStore(user.magasins[0].code);
    }
  }, [user]);

  useEffect(() => {
    if (selectedStore && selectedStore !== 'all') {
      fetchAllSalesData();
    }
  }, [selectedStore, dateRange]);

  const filteredBestSellers = bestSellers.filter(product =>
    product.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.codeProduit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = dailySales.reduce((sum, sale) => sum + sale.ca, 0);
  const totalTickets = dailySales.reduce((sum, sale) => sum + sale.tickets, 0);
  const totalQuantity = dailySales.reduce((sum, sale) => sum + sale.quantite, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analyse des Ventes</h1>
            <p className="text-muted-foreground">
              Analysez les performances de vente et les tendances
            </p>
          </div>
          <Button onClick={fetchAllSalesData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {/* Filters */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtres</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Magasin</Label>
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un magasin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les magasins</SelectItem>
                    {user?.magasins?.map((store) => (
                      <SelectItem key={store.code} value={store.code}>
                        {store.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Input
                  type="date"
                  value={format(dateRange.from, 'yyyy-MM-dd')}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Input
                  type="date"
                  value={format(dateRange.to, 'yyyy-MM-dd')}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRevenue.toLocaleString('fr-FR')} €</div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTickets.toLocaleString('fr-FR')}</div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quantités Vendues</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuantity.toLocaleString('fr-FR')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="best-sellers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="best-sellers">Meilleurs Vendeurs</TabsTrigger>
            <TabsTrigger value="daily-sales">Ventes Quotidiennes</TabsTrigger>
            <TabsTrigger value="hourly-sales">Ventes Horaires</TabsTrigger>
            <TabsTrigger value="sales-lines">Lignes de Vente</TabsTrigger>
          </TabsList>

          {/* Best Sellers Tab */}
          <TabsContent value="best-sellers" className="space-y-4">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Meilleurs Produits Vendeurs</span>
                </CardTitle>
                <CardDescription>
                  Produits les plus vendus sur la période sélectionnée
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <Input
                    placeholder="Rechercher un produit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div className="space-y-3">
                  {filteredBestSellers.map((product, index) => (
                    <div key={product.codeProduit} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <div className="font-medium">{product.designation}</div>
                          <div className="text-sm text-muted-foreground">{product.codeProduit}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{product.quantiteVendue || 0} unités</div>
                        <div className="text-sm text-muted-foreground">{product.ca?.toLocaleString('fr-FR')} €</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Sales Tab */}
          <TabsContent value="daily-sales" className="space-y-4">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Évolution des Ventes Quotidiennes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="ca" stroke="#8884d8" name="CA (€)" />
                    <Line type="monotone" dataKey="tickets" stroke="#82ca9d" name="Tickets" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hourly Sales Tab */}
          <TabsContent value="hourly-sales" className="space-y-4">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Ventes par Heure</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ca" fill="#8884d8" name="CA (€)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Lines Tab */}
          <TabsContent value="sales-lines" className="space-y-4">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Détail des Lignes de Vente</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salesLines.slice(0, 20).map((line, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{line.designation}</div>
                        <div className="text-sm text-muted-foreground">
                          {line.codeProduit} • {format(new Date(line.dateVente), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{line.quantite} × {line.prixUnitaire.toFixed(2)} €</div>
                        <div className="text-sm text-muted-foreground">{line.montant.toFixed(2)} €</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Sales;