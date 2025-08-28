import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { updateServerConfig, testServerConnection } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ServerConfigProps {
  onConfigured: () => void;
}

export const ServerConfig: React.FC<ServerConfigProps> = ({ onConfigured }) => {
  const [serverIP, setServerIP] = useState('192.168.1.10');
  const [serverPort, setServerPort] = useState('8080');
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  const { toast } = useToast();

  const handleTest = async () => {
    setTesting(true);
    try {
      const isConnected = await testServerConnection(serverIP, serverPort);
      setConnectionStatus(isConnected ? 'connected' : 'failed');
      
      if (isConnected) {
        updateServerConfig(serverIP, serverPort);
        toast({
          title: 'Connexion réussie',
          description: 'Configuration serveur sauvegardée',
        });
        setTimeout(() => onConfigured(), 1000);
      } else {
        toast({
          title: 'Connexion échouée',
          description: 'Vérifiez l\'IP et le port du serveur',
          variant: 'destructive'
        });
      }
    } catch (error) {
      setConnectionStatus('failed');
      toast({
        title: 'Erreur',
        description: 'Impossible de tester la connexion',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = () => {
    if (testing) return <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />;
    if (connectionStatus === 'connected') return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (connectionStatus === 'failed') return <XCircle className="h-5 w-5 text-red-600" />;
    return <Settings className="h-5 w-5 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Configuration Serveur</CardTitle>
          <CardDescription>
            Configurez l'adresse IP de votre serveur avant de continuer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ip">Adresse IP du serveur</Label>
            <Input
              id="ip"
              value={serverIP}
              onChange={(e) => setServerIP(e.target.value)}
              placeholder="192.168.1.10"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              value={serverPort}
              onChange={(e) => setServerPort(e.target.value)}
              placeholder="8080"
            />
          </div>

          {connectionStatus !== 'unknown' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              {getStatusIcon()}
              <span className={`text-sm font-medium ${
                connectionStatus === 'connected' ? 'text-green-600' :
                connectionStatus === 'failed' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {connectionStatus === 'connected' ? 'Connexion réussie' :
                 connectionStatus === 'failed' ? 'Connexion échouée' : 'Test en cours...'}
              </span>
            </div>
          )}

          <Button 
            onClick={handleTest}
            disabled={testing || !serverIP.trim()}
            className="w-full"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Test en cours...
              </>
            ) : (
              'Tester et Continuer'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
