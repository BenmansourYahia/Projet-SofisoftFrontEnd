import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CalendarDateRangePicker } from '@/components/ui/calendar-date-range-picker';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  DollarSign,
  ShoppingCart,
  Package,
  Target,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import api, { endpoints } from '@/lib/api';
import { MyResponse, CompareResponse, MagasinInfo, ComparePeriodeResponse } from '@/types/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { addDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const Comparateur: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date()
  });
  const [compareData, setCompareData] = useState<CompareResponse | null>(null);
  const [periodComparison, setPeriodComparison] = useState<ComparePeriodeResponse | null>(null);
  const [selectedStoreForPeriod, setSelectedStoreForPeriod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [periodLoading, setPeriodLoading] = useState(false);

  const handleStoreSelection = (storeCode: string, checked: boolean) => {
    if (checked) {
      setSelectedStores(prev => [...prev, storeCode]);
    } else {
      setSelectedStores(prev => prev.filter(code => code !== storeCode));
    }
  };

  const compareStores = async () => {
    if (selectedStores.length < 2) {
      toast({
        title: 'Sélection insuffisante',
        description: 'Veuillez sélectionner au moins 2 magasins pour la comparaison',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Debug: log the payload sent to backend
      console.log('compareMagasins payload:', selectedStores);
      // Backend expects a raw array of codes, not an object
      const response = await api.post(endpoints.compareMagasins, selectedStores);
      if (response.data && Array.isArray(response.data.magasins) && response.data.magasins.length > 0) {
        setCompareData(response.data);
      } else {
        setCompareData(null);
        toast({
          title: 'Erreur',
          description: 'Réponse du serveur invalide ou vide',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de comparer les magasins',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const [period1, setPeriod1] = useState({
    from: addDays(new Date(), -60),
    to: addDays(new Date(), -31)
  });
  const [period2, setPeriod2] = useState({
    from: addDays(new Date(), -30),
    to: new Date()
  });

  const comparePeriods = async () => {
    if (!selectedStoreForPeriod) {
      toast({
        title: 'Magasin non sélectionné',
        description: 'Veuillez sélectionner un magasin pour la comparaison de périodes',
        variant: 'destructive',
      });
      return;
    }
    setPeriodLoading(true);
    try {
      const payload = {
        codeMagasin: selectedStoreForPeriod,
        dateDebut_1: `${format(period1.from, 'dd-MM-yyyy')} 00:00:00`,
        dateFin_1: `${format(period1.to, 'dd-MM-yyyy')} 23:59:59`,
        dateDebut_2: `${format(period2.from, 'dd-MM-yyyy')} 00:00:00`,
        dateFin_2: `${format(period2.to, 'dd-MM-yyyy')} 23:59:59`,
      };
      const response = await api.post(endpoints.getComparePeriode, payload);
      console.log('getComparePeriode raw response:', response.data);
      if (response.data.success) {
        const parsed = JSON.parse(response.data.data);
        console.log('getComparePeriode parsed data:', parsed);
        setPeriodComparison(parsed);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de comparer les périodes',
        variant: 'destructive',
      });
    } finally {
      setPeriodLoading(false);
    }
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-success" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-danger" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-danger';
    return 'text-muted-foreground';
  };

  // Prepare chart data
  const chartData = compareData?.magasins.map(store => ({
    name: store.nom,
    ca: store.ca,
    tickets: store.tickets,
    quantite: store.quantite,
    panierMoyen: store.panierMoyen
  })) || [];

  const radarData = compareData?.magasins.map(store => ({
    magasin: store.nom,
    CA: (store.ca / Math.max(...(compareData?.magasins.map(s => s.ca) || [1]))) * 100,
    Tickets: (store.tickets / Math.max(...(compareData?.magasins.map(s => s.tickets) || [1]))) * 100,
    Quantité: (store.quantite / Math.max(...(compareData?.magasins.map(s => s.quantite) || [1]))) * 100,
    PanierMoyen: (store.panierMoyen / Math.max(...(compareData?.magasins.map(s => s.panierMoyen) || [1]))) * 100
  })) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comparateur</h1>
          <p className="text-muted-foreground">
            Analysez et comparez les performances de vos magasins
          </p>
        </div>

        {/* Store Comparison Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Store Selection */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Comparaison Multi-Magasins</span>
              </CardTitle>
              <CardDescription>
                Sélectionnez les magasins à comparer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date picker removed for multi-magasins comparison as backend does not expect dates */}

              <div>
                <Label>Magasins à comparer</Label>
                <div className="space-y-2 mt-2">
                  {user?.magasins?.map((store) => (
                    <div key={store.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={store.code}
                        checked={selectedStores.includes(store.code)}
                        onCheckedChange={(checked) => 
                          handleStoreSelection(store.code, checked as boolean)
                        }
                      />
                      <Label htmlFor={store.code} className="text-sm font-normal">
                        {store.nom}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={compareStores} 
                  disabled={loading || selectedStores.length < 2}
                  className="w-full"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    'Comparer les Magasins'
                  )}
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => {
                    setSelectedStores([]);
                    setCompareData(null);
                  }}
                  className="w-full"
                >
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Period Comparison */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Comparaison de Périodes</span>
              </CardTitle>
              <CardDescription>
                Comparez avec la période précédente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Magasin à analyser</Label>
                  <select 
                    className="w-full mt-1 p-2 border border-border rounded-md bg-background"
                    value={selectedStoreForPeriod}
                    onChange={(e) => setSelectedStoreForPeriod(e.target.value)}
                  >
                    <option value="">Sélectionner un magasin</option>
                    {user?.magasins?.map((store) => (
                      <option key={store.code} value={store.code}>
                        {store.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Période 1</Label>
                    <CalendarDateRangePicker
                      date={period1}
                      onDateChange={setPeriod1}
                    />
                  </div>
                  <div>
                    <Label>Période 2</Label>
                    <CalendarDateRangePicker
                      date={period2}
                      onDateChange={setPeriod2}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={comparePeriods} 
                    disabled={periodLoading || !selectedStoreForPeriod}
                    className="w-full"
                  >
                    {periodLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      'Comparer les Périodes'
                    )}
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => {
                      setSelectedStoreForPeriod('');
                      setPeriod1({ from: addDays(new Date(), -60), to: addDays(new Date(), -31) });
                      setPeriod2({ from: addDays(new Date(), -30), to: new Date() });
                      setPeriodComparison(null);
                    }}
                    className="w-full"
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>

              {/* Render period comparison results from parsed array */}
              {Array.isArray(periodComparison) && periodComparison.length === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border">
                  {periodComparison.map((period, idx) => (
                    period ? (
                      <div
                        key={idx}
                        className="rounded-2xl shadow-elegant bg-card/80 border border-border p-8 flex flex-col gap-4"
                      >
                        <h3 className="font-bold text-2xl mb-6 text-primary">Période {idx + 1}</h3>
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col items-center mb-2">
                            <span className="font-semibold text-muted-foreground text-base">Magasin</span>
                            <span className="font-extrabold text-foreground text-xl mt-1 text-center">{period.nomMagasin}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-muted-foreground">Montant TTC</span>
                            <span className="font-bold text-blue-500 text-lg text-right">{period.montantTTC?.toLocaleString()} DH</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-muted-foreground">Quantité</span>
                            <span className="font-bold text-green-500 text-right">{period.quantite?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-muted-foreground">Nombre Tickets</span>
                            <span className="font-bold text-purple-500 text-right">{period.nombreTickets?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-muted-foreground">Prix Moyen</span>
                            <span className="font-bold text-orange-500 text-right">{period.prixMoyen?.toFixed(2)} DH</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-muted-foreground">Taux Objectif</span>
                            <span className="font-bold text-cyan-500 text-right">{period.tauxObjectif?.toFixed(2)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-muted-foreground">Débit Moyen</span>
                            <span className="font-bold text-pink-500 text-right">{period.debitMoyen?.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-muted-foreground">Panier Moyen</span>
                            <span className="font-bold text-yellow-500 text-right">{period.panierMoyen?.toFixed(2)} DH</span>
                          </div>
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comparison Results */}
        {compareData && Array.isArray(compareData.magasins) && compareData.magasins.length > 0 && (
          <div className="space-y-6">
            {/* Performance Overview */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Vue d'ensemble des Performances</CardTitle>
                <CardDescription>
                  Comparaison des KPIs pour les magasins sélectionnés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {compareData.magasins.map((store: any, idx: number) => (
                    <div key={store.code || idx} className="p-4 rounded-lg border border-border bg-card/50">
                      <h4 className="font-semibold text-foreground mb-3">{store.nomMagasin || store.nom || '-'}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">CA</span>
                          <span className="font-bold text-foreground">
                            {typeof store.montantTTC === 'number' ? store.montantTTC.toLocaleString() : (typeof store.ca === 'number' ? store.ca.toLocaleString() : '-')} DH
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Tickets</span>
                          <span className="font-semibold text-foreground">
                            {typeof store.nombreTickets === 'number' ? store.nombreTickets.toLocaleString() : (typeof store.tickets === 'number' ? store.tickets.toLocaleString() : '-')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Quantité</span>
                          <span className="font-semibold text-foreground">
                            {typeof store.quantite === 'number' ? store.quantite.toLocaleString() : '-'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Panier Moyen</span>
                          <span className="font-semibold text-foreground">
                            {typeof store.panierMoyen === 'number' ? store.panierMoyen.toFixed(2) : '-'} DH
                          </span>
                        </div>
                      </div>
                      {/* Performance Badge */}
                      <div className="mt-3">
                        {/* Add badges if needed */}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Écarts Summary Card */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Écarts entre Magasins</CardTitle>
                <CardDescription>
                  Différences entre le magasin le plus performant et le moins performant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="rounded-2xl shadow-elegant bg-card/80 border border-border p-8 flex flex-col items-center gap-3">
                    <span className="font-semibold text-muted-foreground text-base mb-2">Écart CA</span>
                    <span className="font-extrabold text-blue-500 text-2xl">{compareData.ecartCA?.toLocaleString()} DH</span>
                  </div>
                  <div className="rounded-2xl shadow-elegant bg-card/80 border border-border p-8 flex flex-col items-center gap-3">
                    <span className="font-semibold text-muted-foreground text-base mb-2">Écart Tickets</span>
                    <span className="font-extrabold text-green-500 text-2xl">{compareData.ecartTickets?.toLocaleString()}</span>
                  </div>
                  <div className="rounded-2xl shadow-elegant bg-card/80 border border-border p-8 flex flex-col items-center gap-3">
                    <span className="font-semibold text-muted-foreground text-base mb-2">Écart Quantité</span>
                    <span className="font-extrabold text-purple-500 text-2xl">{compareData.ecartQuantite?.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Comparateur;