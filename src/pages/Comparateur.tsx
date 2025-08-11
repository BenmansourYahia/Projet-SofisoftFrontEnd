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
      const response = await api.post<MyResponse<CompareResponse>>(endpoints.compareMagasins, {
        magasinCodes: selectedStores,
        dateDebut: format(dateRange.from, 'yyyy-MM-dd'),
        dateFin: format(dateRange.to, 'yyyy-MM-dd')
      });

      if (response.data.success) {
        setCompareData(response.data.data);
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
      const response = await api.post<MyResponse<ComparePeriodeResponse>>(endpoints.getComparePeriode, {
        magasinCode: selectedStoreForPeriod,
        dateDebut: format(dateRange.from, 'yyyy-MM-dd'),
        dateFin: format(dateRange.to, 'yyyy-MM-dd')
      });

      if (response.data.success) {
        setPeriodComparison(response.data.data);
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
              <div>
                <Label>Période d'analyse</Label>
                <CalendarDateRangePicker
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>

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

              {periodComparison && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">CA</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">
                        {periodComparison.periodeActuelle.ca.toLocaleString()}€
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {periodComparison.periodePrecedente.ca.toLocaleString()}€
                      </span>
                      {getTrendIcon(periodComparison.ecart.ca)}
                      <span className={getTrendColor(periodComparison.ecart.ca)}>
                        {formatPercentage(periodComparison.ecart.ca)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tickets</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">
                        {periodComparison.periodeActuelle.tickets.toLocaleString()}
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {periodComparison.periodePrecedente.tickets.toLocaleString()}
                      </span>
                      {getTrendIcon(periodComparison.ecart.tickets)}
                      <span className={getTrendColor(periodComparison.ecart.tickets)}>
                        {formatPercentage(periodComparison.ecart.tickets)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Quantité</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">
                        {periodComparison.periodeActuelle.quantite.toLocaleString()}
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {periodComparison.periodePrecedente.quantite.toLocaleString()}
                      </span>
                      {getTrendIcon(periodComparison.ecart.quantite)}
                      <span className={getTrendColor(periodComparison.ecart.quantite)}>
                        {formatPercentage(periodComparison.ecart.quantite)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comparison Results */}
        {compareData && (
          <div className="space-y-6">
            {/* Performance Overview */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Vue d'ensemble des Performances</CardTitle>
                <CardDescription>
                  Comparaison des KPIs pour la période du {format(dateRange.from, 'PPP', { locale: fr })} au {format(dateRange.to, 'PPP', { locale: fr })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {compareData.magasins.map((store) => (
                    <div key={store.code} className="p-4 rounded-lg border border-border bg-card/50">
                      <h4 className="font-semibold text-foreground mb-3">{store.nom}</h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">CA</span>
                          <span className="font-bold text-foreground">
                            {store.ca.toLocaleString()}€
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Tickets</span>
                          <span className="font-semibold text-foreground">
                            {store.tickets.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Quantité</span>
                          <span className="font-semibold text-foreground">
                            {store.quantite.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Panier Moyen</span>
                          <span className="font-semibold text-foreground">
                            {store.panierMoyen.toFixed(2)}€
                          </span>
                        </div>
                      </div>

                      {/* Performance Badge */}
                      <div className="mt-3">
                        {store.ca === Math.max(...compareData.magasins.map(s => s.ca)) && (
                          <Badge variant="default" className="gradient-primary">
                            🏆 Meilleur CA
                          </Badge>
                        )}
                        {store.tickets === Math.max(...compareData.magasins.map(s => s.tickets)) && (
                          <Badge variant="secondary" className="ml-1">
                            👥 + Tickets
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Bar Chart */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Comparaison des Chiffres d'Affaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis 
                        dataKey="name" 
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
                      <Bar 
                        dataKey="ca" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Radar Chart */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Analyse Multi-Critères</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--muted))" />
                      <PolarAngleAxis 
                        dataKey="magasin" 
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Radar
                        name="Performance"
                        dataKey="CA"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Ranking Table */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Classement Détaillé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {compareData.magasins
                    .sort((a, b) => b.ca - a.ca)
                    .map((store, index) => (
                      <div key={store.code} className="flex items-center space-x-4 p-4 rounded-lg bg-muted/30">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                          index === 1 ? 'bg-gray-500/20 text-gray-400' :
                          index === 2 ? 'bg-orange-500/20 text-orange-500' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{store.nom}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center space-x-1">
                              <DollarSign className="h-3 w-3" />
                              <span>{store.ca.toLocaleString()}€</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <ShoppingCart className="h-3 w-3" />
                              <span>{store.tickets} tickets</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Package className="h-3 w-3" />
                              <span>{store.quantite} unités</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Target className="h-3 w-3" />
                              <span>{store.panierMoyen.toFixed(2)}€ panier</span>
                            </span>
                          </div>
                        </div>
                        
                        {index === 0 && (
                          <Badge variant="default" className="gradient-primary">
                            Champion
                          </Badge>
                        )}
                      </div>
                    ))}
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