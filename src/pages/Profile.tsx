import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Store, 
  Settings, 
  Edit
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [ip, setIp] = useState<string | null>(null);
  const [editingIp, setEditingIp] = useState(false);
  const [newIp, setNewIp] = useState('');

  // 🔹 Récupérer l'adresse IP publique
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => setIp(data.ip))
      .catch(() => setIp("Non disponible"));
  }, []);

  const handleSaveIp = () => {
    if (newIp) {
      setIp(newIp);
      setEditingIp(false);
      toast({
        title: 'IP mise à jour',
        description: 'L\'adresse IP a été modifiée avec succès',
      });
    }
  };

  const handleCancelIp = () => {
    setEditingIp(false);
    setNewIp('');
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

            {/* Infos rapides */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Infos rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Adresse IP */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Adresse IP</span>
                      {!editingIp && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setNewIp(ip || '');
                            setEditingIp(true);
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          Modifier
                        </Button>
                      )}
                    </div>
                    {editingIp ? (
                      <div className="flex gap-2">
                        <Input
                          value={newIp}
                          onChange={(e) => setNewIp(e.target.value)}
                          className="h-8 text-sm"
                          placeholder="Nouvelle adresse IP"
                        />
                        <Button 
                          onClick={handleSaveIp}
                          size="sm"
                          className="h-8 px-2"
                        >
                          ✓
                        </Button>
                        <Button 
                          onClick={handleCancelIp}
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <span className="font-mono text-lg font-semibold">
                        {ip || 'Non défini'}
                      </span>
                    )}
                  </div>

                  {/* Nombre de magasins */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-secondary/10 to-secondary/5 flex flex-col">
                    <span className="text-sm text-muted-foreground">Magasins accessibles</span>
                    <span className="font-mono text-lg font-semibold">
                      {user?.magasins?.length || 0}
                    </span>
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