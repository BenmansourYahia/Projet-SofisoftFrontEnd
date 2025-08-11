import React, { useState, useEffect } from 'react';
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

  const fetchDashboardData = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Demo data
      const demoStoreData: DashboardModel[] = [
        { magasinCode: 'MAG001', magasinNom: 'Magasin Centre-Ville', ca: 125000, tickets: 3456, quantite: 12890, prixMoyen: 36.15, panierMoyen: 52.30, periode: '2024-01' },
        { magasinCode: 'MAG002', magasinNom: 'Magasin Banlieue', ca: 98500, tickets: 2987, quantite: 9876, prixMoyen: 32.98, panierMoyen: 48.75, periode: '2024-01' },
        { magasinCode: 'MAG003', magasinNom: 'Magasin Sud', ca: 156800, tickets: 4123, quantite: 15467, prixMoyen: 38.42, panierMoyen: 55.20, periode: '2024-01' }
      ];
      
      const demoEvolutionData: EvolutionCAModel[] = [
        { date: '2024-01-20', montant: 4500 },
        { date: '2024-01-21', montant: 5200 },
        { date: '2024-01-22', montant: 4800 },
        { date: '2024-01-23', montant: 6100 },
        { date: '2024-01-24', montant: 5800 },
        { date: '2024-01-25', montant: 7200 },
        { date: '2024-01-26', montant: 6800 },
        { date: '2024-01-27', montant: 5900 }
      ];
      
      setDashboardData(demoStoreData);
      setEvolutionData(demoEvolutionData);
      
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du dashboard',
        variant: 'destructive',
      });
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
  }, []);

  // Calculate aggregated metrics
  const filteredData = selectedStore === 'ALL' 
    ? dashboardData 
    : dashboardData.filter(item => item.magasinCode === selectedStore);

  const totalCA = filteredData.reduce((sum, item) => sum + item.ca, 0);
  const totalTickets = filteredData.reduce((sum, item) => sum + item.tickets, 0);
  const totalQuantite = filteredData.reduce((sum, item) => sum + item.quantite, 0);
  const avgPrixMoyen = filteredData.length > 0 
    ? filteredData.reduce((sum, item) => sum + item.prixMoyen, 0) / filteredData.length 
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
            value={`${totalCA.toLocaleString()} €`}
            change={15.2}
            changeLabel="vs mois dernier"
            icon={DollarSign}
            variant="success"
          />
          <MetricCard
            title="Nombre de Tickets"
            value={totalTickets.toLocaleString()}
            change={8.5}
            changeLabel="vs mois dernier"
            icon={ShoppingCart}
            variant="default"
          />
          <MetricCard
            title="Quantité Vendue"
            value={totalQuantite.toLocaleString()}
            change={-2.1}
            changeLabel="vs mois dernier"
            icon={Package}
            variant="warning"
          />
          <MetricCard
            title="Prix Moyen"
            value={`${avgPrixMoyen.toFixed(2)} €`}
            change={5.3}
            changeLabel="vs mois dernier"
            icon={TrendingUp}
            variant="success"
          />
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
                    tickFormatter={(value) => `${value.toLocaleString()}€`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any) => [`${value.toLocaleString()}€`, 'CA']}
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
                {dashboardData
                  .sort((a, b) => b.ca - a.ca)
                  .slice(0, 5)
                  .map((store, index) => (
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
                          {store.ca.toLocaleString()}€
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {store.panierMoyen.toFixed(2)}€/panier
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
                      CA: {item.ca.toLocaleString()}€ • {item.tickets} tickets
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