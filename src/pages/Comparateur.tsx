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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import { addDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const Comparateur: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [periodComparison, setPeriodComparison] = useState<any>(null);

  const handleStoreSelection = (storeCode: string, checked: boolean) => {
    if (checked) {
      if (selectedStores.length >= 2) {
        toast({
          title: 'Limite atteinte',
          description: 'Vous ne pouvez sélectionner que 2 magasins maximum pour la comparaison.',
          variant: 'destructive',
        });
        return;
      }
      setSelectedStores(prev => [...prev, storeCode]);
    } else {
      setSelectedStores(prev => prev.filter(code => code !== storeCode));
    }
  };

  const [period1, setPeriod1] = useState({
    from: addDays(new Date(), -30),
    to: new Date()
  });
  
  const [comparisonType, setComparisonType] = useState('month'); // 'month', 'year', 'week'
  
  // Calculate period2 automatically based on period1 and comparison type
  const calculatePeriod2 = (period1: { from: Date; to: Date }, type: string) => {
    if (!period1.from || !period1.to || isNaN(period1.from.getTime()) || isNaN(period1.to.getTime())) {
      console.warn('Invalid period1 dates:', period1);
      return { 
        from: new Date(2020, 0, 1), // Default to 1 Jan 2020
        to: new Date(2020, 0, 31)   // Default to 31 Jan 2020
      };
    }
    
    const duration = Math.abs(period1.to.getTime() - period1.from.getTime());
    
    try {
      switch (type) {
        case 'month': {
          // Previous month, same duration
          const monthBefore = new Date(period1.from.getTime());
          const currentMonth = monthBefore.getMonth();
          const currentYear = monthBefore.getFullYear();
          
          // Set to previous month
          if (currentMonth === 0) {
            monthBefore.setFullYear(currentYear - 1);
            monthBefore.setMonth(11);
          } else {
            monthBefore.setMonth(currentMonth - 1);
          }
          
          const endDate = new Date(monthBefore.getTime() + duration);
          
          // Validate dates are reasonable
          if (monthBefore.getFullYear() < 1900 || endDate.getFullYear() > 2100) {
            throw new Error('Date out of reasonable range');
          }
          
          return {
            from: monthBefore,
            to: endDate
          };
        }
        
        case 'year': {
          // Same period, previous year
          const yearBefore = new Date(period1.from.getTime());
          const endDate = new Date(period1.to.getTime());
          
          yearBefore.setFullYear(yearBefore.getFullYear() - 1);
          endDate.setFullYear(endDate.getFullYear() - 1);
          
          // Validate dates are reasonable
          if (yearBefore.getFullYear() < 1900 || endDate.getFullYear() > 2100) {
            throw new Error('Date out of reasonable range');
          }
          
          return {
            from: yearBefore,
            to: endDate
          };
        }
        
        case 'week': {
          // Previous week, same duration
          const weekBefore = new Date(period1.from.getTime());
          weekBefore.setDate(weekBefore.getDate() - 7);
          const endDate = new Date(weekBefore.getTime() + duration);
          
          // Validate dates are reasonable
          if (weekBefore.getFullYear() < 1900 || endDate.getFullYear() > 2100) {
            throw new Error('Date out of reasonable range');
          }
          
          return {
            from: weekBefore,
            to: endDate
          };
        }
        
        default:
          return {
            from: new Date(period1.from.getTime()),
            to: new Date(period1.to.getTime())
          };
      }
    } catch (error) {
      console.error('Error calculating period2:', error);
      // Return safe default dates
      return {
        from: new Date(2020, 0, 1),
        to: new Date(2020, 0, 31)
      };
    }
  };
  
  const period2 = calculatePeriod2(period1, comparisonType);

  const comparePeriods = async () => {
    if (selectedStores.length === 0) {
      toast({
        title: 'Aucun magasin sélectionné',
        description: 'Veuillez sélectionner au moins un magasin pour la comparaison de périodes',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate dates before sending
    const period2Calculated = calculatePeriod2(period1, comparisonType);
    
    // Strict date validation
    const isValidDate = (date: Date) => {
      return date instanceof Date && 
             !isNaN(date.getTime()) && 
             date.getFullYear() >= 1900 && 
             date.getFullYear() <= 2100;
    };
    
    if (!isValidDate(period1.from) || !isValidDate(period1.to) || 
        !isValidDate(period2Calculated.from) || !isValidDate(period2Calculated.to)) {
      toast({
        title: 'Erreur de dates',
        description: 'Les dates sélectionnées sont invalides. Veuillez choisir des dates valides.',
        variant: 'destructive',
      });
      console.error('Invalid dates:', { period1, period2Calculated });
      return;
    }
    
    // Check if dates are in logical order
    if (period1.from >= period1.to || period2Calculated.from >= period2Calculated.to) {
      toast({
        title: 'Erreur de dates',
        description: 'La date de fin doit être postérieure à la date de début.',
        variant: 'destructive',
      });
      return;
    }
    
    setPeriodLoading(true);
    try {
      // Call API for each selected store
      const results = await Promise.all(
        selectedStores.map(async (storeCode) => {
          try {
            const payload = {
              codeMagasin: storeCode,
              dateDebut_1: format(period1.from, 'dd-MM-yyyy') + ' 00:00:00',
              dateFin_1: format(period1.to, 'dd-MM-yyyy') + ' 23:59:59',
              dateDebut_2: format(period2Calculated.from, 'dd-MM-yyyy') + ' 00:00:00',
              dateFin_2: format(period2Calculated.to, 'dd-MM-yyyy') + ' 23:59:59',
            };
            console.log('Sending payload for store', storeCode, ':', payload);
            
            const response = await api.post(endpoints.getComparePeriode, payload);
            if (response.data.success) {
              const parsed = JSON.parse(response.data.data);
              return { storeCode, data: parsed, error: null };
            }
            return { storeCode, data: null, error: 'No data received' };
          } catch (storeError) {
            console.error(`Error for store ${storeCode}:`, storeError);
            return { storeCode, data: null, error: storeError };
          }
        })
      );
      
      // Filter out failed requests
      const successfulResults = results.filter(result => result.data !== null);
      
      if (successfulResults.length === 0) {
        toast({
          title: 'Aucune donnée',
          description: 'Aucune donnée disponible pour les périodes sélectionnées.',
          variant: 'destructive',
        });
        return;
      }
      
      console.log('Multi-store period comparison results:', successfulResults);
      setPeriodComparison(successfulResults);
      
      if (successfulResults.length < results.length) {
        toast({
          title: 'Données partielles',
          description: `Données récupérées pour ${successfulResults.length}/${results.length} magasins.`,
          variant: 'default',
        });
      }
    } catch (error: unknown) {
      console.error('Error in comparePeriods:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de comparer les périodes. Vérifiez les dates et réessayez.',
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

        {/* Enhanced Period Comparison with Multiple Stores */}
        <div className="grid gap-6">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Comparaison de Périodes - Multi-Magasins</span>
              </CardTitle>
              <CardDescription>
                Comparez les performances de plusieurs magasins sur deux périodes différentes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Store Selection */}
              <div>
                <Label className="text-base font-semibold">Magasins à analyser (maximum 2)</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Sélectionnez jusqu'à 2 magasins pour comparer leurs performances
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                  {user?.magasins?.map((store) => {
                    const isSelected = selectedStores.includes(store.code);
                    const isDisabled = !isSelected && selectedStores.length >= 2;
                    
                    return (
                      <div 
                        key={store.code} 
                        className={`flex items-center space-x-2 p-3 border border-border rounded-lg transition-colors ${
                          isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/50'
                        }`}
                      >
                        <Checkbox
                          id={`period-${store.code}`}
                          checked={isSelected}
                          disabled={isDisabled}
                          onCheckedChange={(checked) => 
                            handleStoreSelection(store.code, checked as boolean)
                          }
                        />
                        <Label 
                          htmlFor={`period-${store.code}`} 
                          className={`text-sm font-normal flex-1 ${
                            isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          {store.nom}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Period Selection */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">Période à analyser</Label>
                    <CalendarDateRangePicker
                      date={period1}
                      onDateChange={setPeriod1}
                    />
                  </div>
                  <div>
                    <Label className="text-base font-semibold">Comparer avec</Label>
                    <select 
                      className="w-full mt-1 p-2 border border-border rounded-md bg-background"
                      value={comparisonType}
                      onChange={(e) => setComparisonType(e.target.value)}
                    >
                      <option value="month">Mois précédent (même durée)</option>
                      <option value="year">Année précédente (même période)</option>
                      <option value="week">Semaine précédente (même durée)</option>
                    </select>
                  </div>
                </div>
                
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <Label className="text-base font-semibold text-muted-foreground">Période 2 (calculée automatiquement)</Label>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm font-medium">
                      📅 {format(period2.from, 'dd/MM/yyyy')} - {format(period2.to, 'dd/MM/yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {comparisonType === 'month' && 'Comparaison avec le mois précédent'}
                      {comparisonType === 'year' && 'Comparaison avec la même période l\'année dernière'}
                      {comparisonType === 'week' && 'Comparaison avec la semaine précédente'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button 
                  onClick={comparePeriods} 
                  disabled={periodLoading || selectedStores.length === 0}
                  className="flex-1"
                >
                  {periodLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Calendar className="h-4 w-4 mr-2" />
                  )}
                  Analyser les Magasins ({selectedStores.length} sélectionné{selectedStores.length > 1 ? 's' : ''})
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => {
                    setSelectedStores([]);
                    setPeriod1({ from: addDays(new Date(), -30), to: new Date() });
                    setComparisonType('month');
                    setPeriodComparison(null);
                  }}
                  className="px-6"
                >
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period Comparison Results for Multiple Stores */}
        {Array.isArray(periodComparison) && periodComparison.length > 0 && (
          <div className="space-y-6">
            {/* Store Performance Cards */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Résultats de Comparaison - Multi-Magasins</CardTitle>
                <CardDescription>
                  Performance de chaque magasin sur les deux périodes sélectionnées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  {periodComparison.map((result: any, idx: number) => {
                    if (!result.data || !Array.isArray(result.data) || result.data.length !== 2) return null;
                    
                    const [period1Data, period2Data] = result.data;
                    const storeName = period1Data?.nomMagasin || period2Data?.nomMagasin || `Magasin ${idx + 1}`;
                    
                    // Calculate differences
                    const caDiff = period1Data?.montantTTC - period2Data?.montantTTC;
                    const caPercent = period2Data?.montantTTC ? ((caDiff / period2Data.montantTTC) * 100) : 0;
                    const ticketsDiff = period1Data?.nombreTickets - period2Data?.nombreTickets;
                    const quantiteDiff = period1Data?.quantite - period2Data?.quantite;
                    const panierDiff = period1Data?.panierMoyen - period2Data?.panierMoyen;

                    return (
                      <div key={result.storeCode} className="rounded-2xl shadow-elegant bg-card border border-border overflow-hidden">
                        {/* Store Header */}
                        <div className="bg-primary/10 p-4 border-b border-border">
                          <h3 className="font-bold text-lg text-primary">{storeName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(period1.from, 'dd/MM/yy', { locale: fr })} - {format(period1.to, 'dd/MM/yy', { locale: fr })} vs {format(period2.from, 'dd/MM/yy', { locale: fr })} - {format(period2.to, 'dd/MM/yy', { locale: fr })}
                          </p>
                        </div>

                        {/* Performance Metrics */}
                        <div className="p-4 space-y-4">
                          {/* CA Comparison */}
                          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Chiffre d'Affaires</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-bold text-blue-600">{period1Data?.montantTTC?.toLocaleString()} DH</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${caPercent >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'}`}>
                                  {caPercent >= 0 ? '+' : ''}{caPercent.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            {getTrendIcon(caPercent)}
                          </div>

                          {/* Tickets Comparison */}
                          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Nombre de Tickets</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-bold text-green-600">{period1Data?.nombreTickets?.toLocaleString()}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${ticketsDiff >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'}`}>
                                  {ticketsDiff >= 0 ? '+' : ''}{ticketsDiff}
                                </span>
                              </div>
                            </div>
                            {getTrendIcon(ticketsDiff)}
                          </div>

                          {/* Quantity Comparison */}
                          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Quantité</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-bold text-purple-600">{period1Data?.quantite?.toLocaleString()}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${quantiteDiff >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'}`}>
                                  {quantiteDiff >= 0 ? '+' : ''}{quantiteDiff}
                                </span>
                              </div>
                            </div>
                            {getTrendIcon(quantiteDiff)}
                          </div>

                          {/* Panier Moyen Comparison */}
                          <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Panier Moyen</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-bold text-orange-600">{period1Data?.panierMoyen?.toFixed(2)} DH</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${panierDiff >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'}`}>
                                  {panierDiff >= 0 ? '+' : ''}{panierDiff.toFixed(2)} DH
                                </span>
                              </div>
                            </div>
                            {getTrendIcon(panierDiff)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Store Comparison Charts */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Analyse des Écarts entre Magasins</CardTitle>
                <CardDescription>
                  Comparaison directe des performances entre vos magasins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {/* Ecarts Analysis - Full Width */}
                  <div className="h-80">
                    <h4 className="font-semibold mb-4 text-center">Écarts de Performance entre Magasins</h4>
                    <div className="space-y-4 h-full overflow-y-auto">
                      {periodComparison.length > 1 && (() => {
                        // Calculate écarts
                        const stores = periodComparison.map((result: any) => {
                          if (!result.data || result.data.length !== 2) return null;
                          const [period1Data] = result.data;
                          return {
                            name: period1Data?.nomMagasin || 'Magasin',
                            ca: period1Data?.montantTTC || 0,
                            quantite: period1Data?.quantite || 0,
                            tickets: period1Data?.nombreTickets || 0,
                            panier: period1Data?.panierMoyen || 0
                          };
                        }).filter(Boolean).sort((a, b) => b.ca - a.ca);

                        const best = stores[0];
                        const worst = stores[stores.length - 1];

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* CA Ecart */}
                            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-blue-700 dark:text-blue-300">Écart Chiffre d'Affaires</span>
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">
                                {best.name} vs {worst.name}
                              </div>
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {(best.ca - worst.ca).toLocaleString()} DH
                              </div>
                              <div className="text-sm text-blue-500 dark:text-blue-400">
                                {((best.ca - worst.ca) / worst.ca * 100).toFixed(1)}% d'écart
                              </div>
                            </div>

                            {/* Quantité Ecart */}
                            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-green-700 dark:text-green-300">Écart Quantité</span>
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">Plus haut vs Plus bas</div>
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {Math.max(...stores.map(s => s.quantite)) - Math.min(...stores.map(s => s.quantite))}
                              </div>
                              <div className="text-sm text-green-500 dark:text-green-400">
                                Unités de différence
                              </div>
                            </div>

                            {/* Tickets Ecart */}
                            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-purple-700 dark:text-purple-300">Écart Tickets</span>
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">Plus haut vs Plus bas</div>
                              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {Math.max(...stores.map(s => s.tickets)) - Math.min(...stores.map(s => s.tickets))}
                              </div>
                              <div className="text-sm text-purple-500 dark:text-purple-400">
                                Tickets de différence
                              </div>
                            </div>

                            {/* Panier Moyen Ecart */}
                            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-orange-700 dark:text-orange-300">Écart Panier Moyen</span>
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">Plus haut vs Plus bas</div>
                              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {(Math.max(...stores.map(s => s.panier)) - Math.min(...stores.map(s => s.panier))).toFixed(2)} DH
                              </div>
                              <div className="text-sm text-orange-500 dark:text-orange-400">
                                Différence de panier moyen
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Performance Table */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-4">Tableau de Classement Détaillé</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-card rounded-lg overflow-hidden shadow-sm">
                      <thead>
                        <tr className="bg-primary/10 border-b border-primary/20">
                          <th className="p-4 text-left font-semibold text-primary">Rang</th>
                          <th className="p-4 text-left font-semibold text-primary">Magasin</th>
                          <th className="p-4 text-right font-semibold text-primary">CA (DH)</th>
                          <th className="p-4 text-right font-semibold text-primary">Quantité</th>
                          <th className="p-4 text-right font-semibold text-primary">Tickets</th>
                          <th className="p-4 text-right font-semibold text-primary">Panier Moyen</th>
                          <th className="p-4 text-right font-semibold text-primary">Écart vs #1</th>
                        </tr>
                      </thead>
                      <tbody>
                        {periodComparison.map((result: any) => {
                          if (!result.data || result.data.length !== 2) return null;
                          const [period1Data] = result.data;
                          return {
                            name: period1Data?.nomMagasin || 'Magasin',
                            ca: period1Data?.montantTTC || 0,
                            quantite: period1Data?.quantite || 0,
                            tickets: period1Data?.nombreTickets || 0,
                            panier: period1Data?.panierMoyen || 0
                          };
                        }).filter(Boolean).sort((a, b) => b.ca - a.ca).map((store, idx) => {
                          const firstCA = periodComparison.map((result: any) => {
                            if (!result.data || result.data.length !== 2) return 0;
                            const [period1Data] = result.data;
                            return period1Data?.montantTTC || 0;
                          }).sort((a, b) => b - a)[0];
                          
                          const ecartPercent = firstCA > 0 ? ((firstCA - store.ca) / firstCA * 100) : 0;
                          
                          // Couleurs selon le rang
                          let rowBg = '';
                          let textColor = '';
                          
                          if (idx === 0) {
                            // Premier - Or
                            rowBg = 'bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-l-yellow-500';
                            textColor = 'text-yellow-700 dark:text-yellow-300';
                          } else if (idx === 1) {
                            // Deuxième - Argent
                            rowBg = 'bg-gray-50 dark:bg-gray-800/50 border-l-4 border-l-gray-400';
                            textColor = 'text-gray-700 dark:text-gray-300';
                          } else if (idx === 2) {
                            // Troisième - Bronze
                            rowBg = 'bg-orange-50 dark:bg-orange-950/20 border-l-4 border-l-orange-500';
                            textColor = 'text-orange-700 dark:text-orange-300';
                          } else if (idx === periodComparison.filter(Boolean).length - 1) {
                            // Dernier - Rouge
                            rowBg = 'bg-red-50 dark:bg-red-950/20 border-l-4 border-l-red-500';
                            textColor = 'text-red-700 dark:text-red-300';
                          } else {
                            // Autres - Neutre
                            rowBg = 'bg-muted/30 hover:bg-muted/50 transition-colors';
                            textColor = 'text-foreground';
                          }
                          
                          return (
                            <tr key={idx} className={rowBg}>
                              <td className={`p-4 font-bold ${textColor}`}>
                                <div className="flex items-center gap-2">
                                  {idx === 0 && <span className="text-2xl">🥇</span>}
                                  {idx === 1 && <span className="text-2xl">🥈</span>}
                                  {idx === 2 && <span className="text-2xl">🥉</span>}
                                  <span>#{idx + 1}</span>
                                </div>
                              </td>
                              <td className={`p-4 font-semibold ${textColor}`}>{store.name}</td>
                              <td className="p-4 text-right font-bold text-blue-600 dark:text-blue-400">
                                {store.ca.toLocaleString()}
                              </td>
                              <td className="p-4 text-right font-semibold text-green-600 dark:text-green-400">
                                {store.quantite.toLocaleString()}
                              </td>
                              <td className="p-4 text-right font-semibold text-purple-600 dark:text-purple-400">
                                {store.tickets.toLocaleString()}
                              </td>
                              <td className="p-4 text-right font-semibold text-orange-600 dark:text-orange-400">
                                {store.panier.toFixed(2)}
                              </td>
                              <td className="p-4 text-right font-bold">
                                {idx === 0 ? (
                                  <span className="text-green-600 dark:text-green-400 font-semibold px-3 py-1 bg-green-100 dark:bg-green-950/30 rounded-full">
                                    👑 Leader
                                  </span>
                                ) : (
                                  <span className="text-red-600 dark:text-red-400 font-semibold px-3 py-1 bg-red-100 dark:bg-red-950/30 rounded-full">
                                    -{ecartPercent.toFixed(1)}%
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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