import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Store, 
  Settings, 
  Edit,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { updateServerConfig, testServerConnection, getCurrentServerConfig } from '@/lib/api';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  // États pour la configuration IP
  const [serverConfig, setServerConfig] = useState(getCurrentServerConfig());
  const [editingServer, setEditingServer] = useState(false);
  const [newServerIP, setNewServerIP] = useState('');
  const [newServerPort, setNewServerPort] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'testing' | 'connected' | 'failed'>('unknown');
  const [publicIP, setPublicIP] = useState<string | null>(null);

  // Récupérer l'adresse IP publique de l'utilisateur
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => setPublicIP(data.ip))
      .catch(() => setPublicIP("Non disponible"));
  }, []);

  // Tester la connexion au démarrage
  useEffect(() => {
    testConnection(serverConfig.ip, serverConfig.port);
  }, [serverConfig.ip, serverConfig.port]);

  const testConnection = async (ip: string, port: string) => {
    setConnectionStatus('testing');
    try {
      const isConnected = await testServerConnection(ip, port);
      setConnectionStatus(isConnected ? 'connected' : 'failed');
    } catch (error) {
      setConnectionStatus('failed');
    }
  };

  const handleSaveServerConfig = async () => {
    if (!newServerIP.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir une adresse IP valide',
        variant: 'destructive'
      });
      return;
    }

    const port = newServerPort.trim() || '8080';
    
    // Tester la connexion avant de sauvegarder
    setConnectionStatus('testing');
    
    try {
      const isConnected = await testServerConnection(newServerIP.trim(), port);
      
      if (isConnected) {
        // Sauvegarder la configuration
        updateServerConfig(newServerIP.trim(), port);
        setServerConfig({
          ip: newServerIP.trim(),
          port: port,
          fullURL: `http://${newServerIP.trim()}:${port}`
        });
        setConnectionStatus('connected');
        setEditingServer(false);
        
        toast({
          title: 'Configuration mise à jour',
          description: `Serveur configuré sur ${newServerIP.trim()}:${port}`,
        });
      } else {
        setConnectionStatus('failed');
        toast({
          title: 'Connexion échouée',
          description: `Impossible de se connecter à ${newServerIP.trim()}:${port}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      setConnectionStatus('failed');
      toast({
        title: 'Erreur de connexion',
        description: 'Vérifiez l\'adresse IP et le port du serveur',
        variant: 'destructive'
      });
    }
  };

  const handleCancelServerConfig = () => {
    setEditingServer(false);
    setNewServerIP('');
    setNewServerPort('');
  };

  const startEditingServer = () => {
    setNewServerIP(serverConfig.ip);
    setNewServerPort(serverConfig.port);
    setEditingServer(true);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'testing': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'testing': return <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />;
      default: return <Wifi className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connecté';
      case 'failed': return 'Connexion échouée';
      case 'testing': return 'Test en cours...';
      default: return 'Statut inconnu';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profil Utilisateur</h1>
            <p className="text-muted-foreground">
              Gérez vos informations personnelles et préférences
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Avatar & Nom centré */}
            <Card className="shadow-elegant">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-28 w-28 bg-primary/20 rounded-full flex items-center justify-center">
                    <User className="h-16 w-16 text-primary" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground">
                      {user?.prenom} {user?.nom}
                    </h2>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <Badge variant="default" className="gradient-primary px-4 py-1">
                    {user?.role || 'Utilisateur'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Infos de connexion */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-200 dark:text-gray-200">
                  <Wifi className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Configuration Serveur
                </CardTitle>
                <CardDescription className="text-gray-200 dark:text-gray-300">
                  Configurez l'adresse IP de votre serveur local pour la communication avec la base de données
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Statut de connexion */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      {getStatusIcon()}
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">Statut de connexion</p>
                        <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testConnection(serverConfig.ip, serverConfig.port)}
                      disabled={connectionStatus === 'testing'}
                    >
                      {connectionStatus === 'testing' ? 'Test...' : 'Tester'}
                    </Button>
                  </div>

                  {/* Configuration IP Serveur */}
                    <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-200 dark:text-gray-300">Configuration serveur</h4>
                      {!editingServer && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={startEditingServer}
                          className="h-8 px-3 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                      )}
                    </div>                    {editingServer ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <Input
                              value={newServerIP}
                              onChange={(e) => setNewServerIP(e.target.value)}
                              placeholder="Adresse IP du serveur"
                              className="h-9"
                            />
                          </div>
                          <Input
                            value={newServerPort}
                            onChange={(e) => setNewServerPort(e.target.value)}
                            placeholder="Port"
                            className="h-9"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleSaveServerConfig}
                            size="sm"
                            className="flex-1"
                            disabled={connectionStatus === 'testing'}
                          >
                            {connectionStatus === 'testing' ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Test...
                              </>
                            ) : (
                              'Sauvegarder'
                            )}
                          </Button>
                          <Button 
                            onClick={handleCancelServerConfig}
                            variant="outline"
                            size="sm"
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">{serverConfig.fullURL}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              IP: {serverConfig.ip} | Port: {serverConfig.port}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Alerte de statut */}
                  {connectionStatus === 'failed' && (
                    <Alert className="border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20">
                      <WifiOff className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <AlertDescription className="text-red-800 dark:text-red-200">
                        Impossible de se connecter au serveur. Vérifiez que votre serveur Spring Boot est démarré 
                        et accessible à l'adresse configurée.
                      </AlertDescription>
                    </Alert>
                  )}

                  {connectionStatus === 'connected' && (
                    <Alert className="border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertDescription className="text-green-800 dark:text-green-200">
                        Connexion établie avec succès ! Votre application peut maintenant communiquer avec la base de données.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Infos réseau utilisateur */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Informations réseau</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {/* IP publique de l'utilisateur */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Votre IP publique</span>
                    <p className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {publicIP || 'Chargement...'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="shadow-elegant border-danger/20">
              <CardHeader>
                <CardTitle className="text-danger">Zone de Danger</CardTitle>
                <CardDescription>
                  Actions irréversibles concernant votre compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={logout} 
                  variant="destructive"
                  className="w-full"
                >
                  Se déconnecter de tous les appareils
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Store Access - CONSERVÉ DE L'ANCIENNE VERSION */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Store className="h-5 w-5" />
                  <span>Accès Magasins</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user?.magasins?.map((store) => (
                    <div key={store.code} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium text-foreground">{store.nom}</p>
                        <p className="text-sm text-muted-foreground">{store.code}</p>
                      </div>
                      <Badge variant="outline">Accès</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Info */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Informations Système</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">SofiSoft v2.1.0</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Dernière connexion</span>
                  <span className="font-medium">Aujourd'hui</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type de compte</span>
                  <span className="font-medium">Administrateur</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;