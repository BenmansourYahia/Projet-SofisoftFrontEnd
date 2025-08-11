import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign, 
  ShoppingCart,
  Package,
  TrendingUp,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import api, { endpoints } from '@/lib/api';
import { MyResponse, Magasin, MagasinInfo } from '@/types/api';

export const Stores: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [stores, setStores] = useState<Magasin[]>([]);
  const [storeInfos, setStoreInfos] = useState<MagasinInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStoresData = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Demo data - use the same stores from user context
      const demoStores: Magasin[] = user?.magasins || [];
      
      const demoStoreInfos: MagasinInfo[] = [
        { code: 'MAG001', nom: 'Magasin Centre-Ville', ca: 125000, tickets: 3456, quantite: 12890, prixMoyen: 36.15, panierMoyen: 52.30, dateDebut: '2024-01-01', dateFin: '2024-01-31' },
        { code: 'MAG002', nom: 'Magasin Banlieue', ca: 98500, tickets: 2987, quantite: 9876, prixMoyen: 32.98, panierMoyen: 48.75, dateDebut: '2024-01-01', dateFin: '2024-01-31' },
        { code: 'MAG003', nom: 'Magasin Sud', ca: 156800, tickets: 4123, quantite: 15467, prixMoyen: 38.42, panierMoyen: 55.20, dateDebut: '2024-01-01', dateFin: '2024-01-31' }
      ];

      setStores(demoStores);
      setStoreInfos(demoStoreInfos);
      
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données des magasins',
        variant: 'destructive',
      });
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchStoresData();
    setRefreshing(false);
    toast({
      title: 'Données actualisées',
      description: 'Les informations des magasins ont été mises à jour',
    });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchStoresData();
      setLoading(false);
    };

    loadData();
  }, []);

  // Calculate total metrics
  const totalCA = storeInfos.reduce((sum, store) => sum + store.ca, 0);
  const totalTickets = storeInfos.reduce((sum, store) => sum + store.tickets, 0);
  const totalQuantite = storeInfos.reduce((sum, store) => sum + store.quantite, 0);
  const avgPanierMoyen = storeInfos.length > 0 
    ? storeInfos.reduce((sum, store) => sum + store.panierMoyen, 0) / storeInfos.length 
    : 0;

  const getStoreInfo = (storeCode: string) => {
    return storeInfos.find(info => info.code === storeCode);
  };

  const getStoreStatus = (storeInfo?: MagasinInfo) => {
    if (!storeInfo) return { status: 'Inactif', variant: 'secondary' as const };
    if (storeInfo.ca > 10000) return { status: 'Excellent', variant: 'default' as const };
    if (storeInfo.ca > 5000) return { status: 'Bon', variant: 'secondary' as const };
    return { status: 'Moyen', variant: 'outline' as const };
  };

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
            <h1 className="text-3xl font-bold text-foreground">Magasins</h1>
            <p className="text-muted-foreground">
              Gestion et suivi des performances de vos points de vente
            </p>
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

        {/* Global Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="CA Total Réseau"
            value={`${totalCA.toLocaleString()} €`}
            change={12.5}
            changeLabel="vs période précédente"
            icon={DollarSign}
            variant="success"
          />
          <MetricCard
            title="Tickets Total"
            value={totalTickets.toLocaleString()}
            change={8.3}
            changeLabel="vs période précédente"
            icon={ShoppingCart}
            variant="default"
          />
          <MetricCard
            title="Quantités Vendues"
            value={totalQuantite.toLocaleString()}
            change={-1.2}
            changeLabel="vs période précédente"
            icon={Package}
            variant="warning"
          />
          <MetricCard
            title="Panier Moyen Réseau"
            value={`${avgPanierMoyen.toFixed(2)} €`}
            change={4.7}
            changeLabel="vs période précédente"
            icon={TrendingUp}
            variant="success"
          />
        </div>

        {/* Stores Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => {
            const storeInfo = getStoreInfo(store.code);
            const { status, variant } = getStoreStatus(storeInfo);

            return (
              <Card key={store.code} className="shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{store.nom}</CardTitle>
                        <CardDescription>{store.code}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={variant}>{status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    {store.adresse && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{store.adresse}</span>
                      </div>
                    )}
                    {store.telephone && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{store.telephone}</span>
                      </div>
                    )}
                    {store.email && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{store.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Performance Metrics */}
                  {storeInfo && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {storeInfo.ca.toLocaleString()}€
                        </p>
                        <p className="text-xs text-muted-foreground">Chiffre d'Affaires</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {storeInfo.tickets.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Tickets</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-foreground">
                          {storeInfo.panierMoyen.toFixed(2)}€
                        </p>
                        <p className="text-xs text-muted-foreground">Panier Moyen</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-foreground">
                          {storeInfo.quantite.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Quantités</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analyser
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Package className="h-4 w-4 mr-2" />
                      Stock
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Performance Ranking */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Classement des Performances</span>
            </CardTitle>
            <CardDescription>
              Classement des magasins par chiffre d'affaires (30 derniers jours)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {storeInfos
                .sort((a, b) => b.ca - a.ca)
                .map((storeInfo, index) => {
                  const store = stores.find(s => s.code === storeInfo.code);
                  const percentage = totalCA > 0 ? (storeInfo.ca / totalCA) * 100 : 0;
                  
                  return (
                    <div key={storeInfo.code} className="flex items-center space-x-4 p-4 rounded-lg bg-muted/30">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                        index === 1 ? 'bg-gray-500/20 text-gray-400' :
                        index === 2 ? 'bg-orange-500/20 text-orange-500' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">
                            {store?.nom || storeInfo.code}
                          </h4>
                          <div className="text-right">
                            <p className="font-bold text-foreground">
                              {storeInfo.ca.toLocaleString()}€
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {percentage.toFixed(1)}% du total
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{storeInfo.tickets} tickets</span>
                          <span>Panier: {storeInfo.panierMoyen.toFixed(2)}€</span>
                          <span>Qty: {storeInfo.quantite}</span>
                        </div>
                        
                        <div className="mt-2 w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Stores;