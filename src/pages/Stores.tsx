import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, MapPin, Phone, Mail, RefreshCw } from 'lucide-react';
import Slider from '@mui/material/Slider';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import api, { endpoints } from '@/lib/api';
import { MyResponse } from '@/types/api';

function formatBackendDate(date: Date, endOfDay = false) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${endOfDay ? '23:59:59' : '00:00:00'}`;
}

export const Stores: React.FC = () => {
  const [magasins, setMagasins] = useState<any[]>([]);
  const [filteredMagasins, setFilteredMagasins] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  // For date range slicer (Power BI style)
  const defaultMinDate = new Date('2022-01-01');
  const defaultMaxDate = new Date();
  const [dateRange, setDateRange] = useState<[number, number]>([
    defaultMinDate.getTime(),
    defaultMaxDate.getTime(),
  ]);
  const [dateMin] = useState(defaultMinDate.getTime());
  const [dateMax] = useState(defaultMaxDate.getTime());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMagasins = async () => {
    try {
      setLoading(true);
      const from = new Date(dateRange[0]);
      const to = new Date(dateRange[1]);
      const debut = formatBackendDate(from, false);
      const fin = formatBackendDate(to, true);
      const response = await api.post<MyResponse<any>>(endpoints.getMagasinsInfoByDate, {
        withDate: true,
        debut,
        fin
      });
      let data: any[] = [];
      if (response.data.success && typeof response.data.data === 'string') {
        data = JSON.parse(response.data.data);
      } else if (response.data.success && Array.isArray(response.data.data)) {
        data = response.data.data;
      }
      setMagasins(data);
      setFilteredMagasins(data);
    } catch (error) {
      setMagasins([]);
      setFilteredMagasins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMagasins();
    // eslint-disable-next-line
  }, [dateRange]);

  // Optionally, update dateMin/dateMax if you want to allow dynamic range
  // useEffect(() => {
  //   // Example: set min/max based on magasins data if needed
  // }, [magasins]);

  useEffect(() => {
    let filtered = magasins;
    if (search) {
      filtered = filtered.filter(m =>
        m.nomMagasin?.toLowerCase().includes(search.toLowerCase()) ||
        m.codeMagasin?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredMagasins(filtered);
  }, [magasins, search]);

  const refreshData = async () => {
    setRefreshing(true);
    await fetchMagasins();
    setRefreshing(false);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Magasins</h1>
            <p className="text-muted-foreground">Liste et informations des magasins</p>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Rechercher par nom ou code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input input-bordered w-64 px-3 py-2 rounded border focus:outline-none"
            />
            {/* Power BI-style date range slicer */}
            <div className="flex flex-col items-center p-2 bg-muted rounded shadow-md min-w-[340px]">
              <div className="font-semibold mb-1">Période</div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="date"
                  value={new Date(dateRange[0]).toISOString().slice(0, 10)}
                  min={new Date(dateMin).toISOString().slice(0, 10)}
                  max={new Date(dateRange[1]).toISOString().slice(0, 10)}
                  onChange={e => setDateRange([new Date(e.target.value).getTime(), dateRange[1]])}
                  className="w-36 px-2 py-1 rounded border"
                  style={{ color: '#111', fontWeight: 700, background: 'white' }}
                />
                <span>→</span>
                <input
                  type="date"
                  value={new Date(dateRange[1]).toISOString().slice(0, 10)}
                  min={new Date(dateRange[0]).toISOString().slice(0, 10)}
                  max={new Date(dateMax).toISOString().slice(0, 10)}
                  onChange={e => setDateRange([dateRange[0], new Date(e.target.value).getTime()])}
                  className="w-36 px-2 py-1 rounded border"
                  style={{ color: '#111', fontWeight: 700, background: 'white' }}
                />
              </div>
              <Slider
                value={dateRange}
                min={dateMin}
                max={dateMax}
                step={24*60*60*1000}
                onChange={(_, newValue) => setDateRange(newValue as [number, number])}
                valueLabelDisplay="off"
                disableSwap
                sx={{ width: 240 }}
              />
              {/* Removed min/max labels for a cleaner look */}
            </div>
            <Button onClick={refreshData} disabled={refreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMagasins.map((store) => (
            <Card key={store.codeMagasin} className="shadow-2xl bg-gradient-to-br from-black via-gray-900 to-gray-800 border border-gray-700 rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="h-6 w-6 text-primary drop-shadow-lg" />
                    <span className="text-lg font-bold text-white tracking-tight drop-shadow">{store.nomMagasin}</span>
                  </div>
                  <span className="text-xs text-gray-300 font-mono drop-shadow">{store.codeMagasin}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-3 flex flex-col items-center border border-gray-700 shadow-md">
                    <span className="text-xs text-gray-400">CA</span>
                    <span className="font-bold text-lg text-white drop-shadow">{store.montantTTC?.toLocaleString() || 0}€</span>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-3 flex flex-col items-center border border-gray-700 shadow-md">
                    <span className="text-xs text-gray-400">Tickets</span>
                    <span className="font-bold text-lg text-white drop-shadow">{store.nombreTickets?.toLocaleString() || 0}</span>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-3 flex flex-col items-center border border-gray-700 shadow-md">
                    <span className="text-xs text-gray-400">Quantité</span>
                    <span className="font-bold text-lg text-white drop-shadow">{store.quantite?.toLocaleString() || 0}</span>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-3 flex flex-col items-center border border-gray-700 shadow-md">
                    <span className="text-xs text-gray-400">Panier Moyen</span>
                    <span className="font-bold text-lg text-white drop-shadow">{store.panierMoyen?.toFixed(2) || 0}€</span>
                  </div>
                </div>
                <div className="mt-3 flex justify-center">
                  <span className="text-xs text-gray-200 bg-gray-800 rounded px-3 py-1 shadow">Gérant: {store.gerant || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Stores;