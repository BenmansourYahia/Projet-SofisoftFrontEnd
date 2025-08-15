import React, { useState, useEffect } from 'react';
import { CalendarDateRangePicker } from '@/components/ui/calendar-date-range-picker';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Store,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import api, { endpoints } from '@/lib/api';
import { MyResponse, DashboardModel, EvolutionCAModel, Magasin } from '@/types/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [dashboardData, setDashboardData] = useState<DashboardModel[]>([]);
  const [evolutionData, setEvolutionData] = useState<EvolutionCAModel[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Default date range: last 30 days counting today
  const getDefaultDateRange = () => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 29);
  return { from: thirtyDaysAgo, to: today };
};
const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => getDefaultDateRange());

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use date range from state
      const dateDebut = dateRange.from.toISOString().slice(0, 10);
      const dateFin = dateRange.to.toISOString().slice(0, 10);

      // Build dashboardMagasins URL: only add codeMagasin if a store is selected
      let dashboardUrl = `${endpoints.dashboardMagasins}?dateDebut=${dateDebut}&dateFin=${dateFin}`;
      if (selectedStore !== 'ALL') {
        dashboardUrl += `&codeMagasin=${selectedStore}`;
      }

      // Build evolutionCA URL: always add dateDebut/dateFin, and codeMagasin if a store is selected
      let evolutionUrl = `${endpoints.evolutionCA}?dateDebut=${dateDebut}&dateFin=${dateFin}`;
      if (selectedStore !== 'ALL') {
        evolutionUrl += `&codeMagasin=${selectedStore}`;
      }

      const dashboardResponse = await api.get(dashboardUrl);
      const evolutionResponse = await api.get(evolutionUrl);

      // Map backend dashboard data to frontend model
      if (dashboardResponse.data && Array.isArray(dashboardResponse.data)) {
        setDashboardData(
          dashboardResponse.data.map((item: any) => ({
            magasinCode: item.codeMagasin,
            magasinNom: item.nomMagasin,
            ca: item.montantTTC,
            tickets: item.nombreTickets,
            quantite: item.quantite,
            prixMoyen: item.prixMoyen,
            panierMoyen: item.panierMoyen,
            debitMoyen: item.debitMoyen,
            tauxObjectif: item.tauxObjectif,
            periode: item.periode || '',
          }))
        );
      } else if (dashboardResponse.data && dashboardResponse.data.success && Array.isArray(dashboardResponse.data.data)) {
        setDashboardData(
          dashboardResponse.data.data.map((item: any) => ({
            magasinCode: item.codeMagasin,
            magasinNom: item.nomMagasin,
            ca: item.montantTTC,
            tickets: item.nombreTickets,
            quantite: item.quantite,
            prixMoyen: item.prixMoyen,
            panierMoyen: item.panierMoyen,
            debitMoyen: item.debitMoyen,
            tauxObjectif: item.tauxObjectif,
            periode: item.periode || '',
          }))
        );
      } else {
        setDashboardData([]);
      }

      // Map backend evolution data to frontend model
      const mapEvolution = (arr: any[]) =>
        arr.map((item: any) => ({
          date: item.jourVente ? new Date(item.jourVente).toISOString() : '',
          montant: item.montantTTC,
          magasinCode: item.codeMagasin || (selectedStore !== 'ALL' ? selectedStore : undefined),
        }));

      if (evolutionResponse.data && Array.isArray(evolutionResponse.data)) {
        setEvolutionData(mapEvolution(evolutionResponse.data));
      } else if (evolutionResponse.data && evolutionResponse.data.success && Array.isArray(evolutionResponse.data.data)) {
        setEvolutionData(mapEvolution(evolutionResponse.data.data));
      } else {
        setEvolutionData([]);
      }
      
    } catch (error: any) {
      console.error('Dashboard API Error:', error);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de charger les données du dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast({
      title: 'Données actualisées',
      description: 'Le dashboard a été mis à jour avec succès',
    });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };
    loadData();
  }, [selectedStore, dateRange]);

  // Calculate aggregated metrics
  let filteredData: DashboardModel[] = [];
  if (selectedStore === 'ALL') {
    filteredData = dashboardData;
  } else {
    filteredData = dashboardData.filter(item => item.magasinCode === selectedStore);
  }

  const totalCA = filteredData.reduce((sum, item) => sum + (item.ca || 0), 0);
  const totalTickets = filteredData.reduce((sum, item) => sum + (item.tickets || 0), 0);
  const totalQuantite = filteredData.reduce((sum, item) => sum + (item.quantite || 0), 0);
  const avgPrixMoyen = filteredData.length > 0 
    ? filteredData.reduce((sum, item) => sum + (item.prixMoyen || 0), 0) / filteredData.length 
    : 0;
  const avgPanierMoyen = filteredData.length > 0 
    ? filteredData.reduce((sum, item) => sum + (item.panierMoyen || 0), 0) / filteredData.length 
    : 0;
  const avgDebitMoyen = filteredData.length > 0 
    ? filteredData.reduce((sum, item) => sum + (item.debitMoyen || 0), 0) / filteredData.length 
    : 0;
  const avgTauxObjectif = filteredData.length > 0 
    ? filteredData.reduce((sum, item) => sum + (item.tauxObjectif || 0), 0) / filteredData.length 
    : 0;

  // Format chart data
  const chartData = evolutionData
    .filter(item => selectedStore === 'ALL' || item.magasinCode === selectedStore)
    .map(item => ({
      date: new Date(item.date).toLocaleDateString('fr-FR', { 
        month: 'short', 
        day: 'numeric' 
      }),
      montant: item.montant
    }));

  // For performance list: show all magasins if ALL, else only selected magasin
  const performanceList = selectedStore === 'ALL'
    ? dashboardData.slice().sort((a, b) => b.ca - a.ca).slice(0, 5)
    : dashboardData.filter(item => item.magasinCode === selectedStore);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Vue d'ensemble des performances de vos magasins
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
               <CalendarDateRangePicker
  date={dateRange}
  onDateChange={(range) => {
    if (range.from && range.to) setDateRange(range);
  }}
  className="w-64"
/>
              <Button
  variant="secondary"
  onClick={() => setDateRange(getDefaultDateRange())}
  className="h-10"
>
  Réinitialiser Dates
</Button>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sélectionner un magasin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tous les magasins</SelectItem>
                    {user?.magasins?.map((magasin) => (
                      <SelectItem key={magasin.code} value={magasin.code}>
                        {magasin.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedStore('ALL')}
                  className="h-10"
                >
                  Réinitialiser Magasin
                </Button>
              </div>
            </div>
            <Button 
              onClick={refreshData} 
              disabled={refreshing}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Chiffre d'Affaires"
            value={totalCA.toLocaleString()}
            icon={DollarSign}
            variant="success"
          />
          <MetricCard
            title="Nombre de Tickets"
            value={totalTickets.toLocaleString()}
            icon={ShoppingCart}
            variant="default"
          />
          <MetricCard
            title="Quantité Vendue"
            value={totalQuantite.toLocaleString()}
            icon={Package}
            variant="warning"
          />
          <MetricCard
            title="Prix Moyen"
            value={`${avgPrixMoyen.toFixed(2)} DH`}
            icon={TrendingUp}
            variant="success"
          />
          <MetricCard
            title="Panier Moyen"
            value={`${avgPanierMoyen.toFixed(2)} DH`}
            icon={TrendingUp}
            variant="default"
          />
          <MetricCard
            title="Débit Moyen"
            value={`${avgDebitMoyen.toFixed(2)} DH`}
            icon={TrendingUp}
            variant="default"
          />
          <Card className="flex flex-col items-center justify-center p-4 border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 w-full">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taux Objectif</CardTitle>
            </CardHeader>
            <CardContent className="w-full">
              <div className="flex items-center gap-2">
                <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-4 bg-primary rounded-full"
                    style={{ width: `${Math.min(100, Math.round(avgTauxObjectif))}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-primary">{avgTauxObjectif.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Evolution CA Chart */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Évolution du Chiffre d'Affaires</span>
              </CardTitle>
              <CardDescription>
                Évolution quotidienne sur les 30 derniers jours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${value.toLocaleString()} DH`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any) => [`${value.toLocaleString()} DH`, 'CA']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="montant" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Store Performance */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Store className="h-5 w-5" />
                <span>Performance par Magasin</span>
              </CardTitle>
              <CardDescription>
                Classement des magasins par CA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceList.map((store, index) => (
                  <div key={store.magasinCode} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                        index === 1 ? 'bg-gray-500/20 text-gray-400' :
                        index === 2 ? 'bg-orange-500/20 text-orange-500' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{store.magasinNom}</p>
                        <p className="text-sm text-muted-foreground">
                          {store.tickets} tickets
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {store.ca.toLocaleString()} DH
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {store.panierMoyen.toFixed(2)} DH/panier
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Activité Récente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      Nouvelle vente - {item.magasinNom}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      CA: {item.ca.toLocaleString()} DH • {item.tickets} tickets
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Il y a {Math.floor(Math.random() * 60)} min
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;