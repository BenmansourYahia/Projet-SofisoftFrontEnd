import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Store, 
  Shield, 
  Edit, 
  Save, 
  X,
  Settings,
  Key,
  Bell
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || '',
    username: user?.username || '',
  });

  const handleSave = async () => {
    // In a real app, you would call an API to update the profile
    setEditing(false);
    toast({
      title: 'Profil mis à jour',
      description: 'Vos informations ont été sauvegardées avec succès',
    });
  };

  const handleCancel = () => {
    setProfileData({
      prenom: user?.prenom || '',
      nom: user?.nom || '',
      email: user?.email || '',
      username: user?.username || '',
    });
    setEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
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
          {!editing && (
            <Button onClick={() => setEditing(true)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Informations Personnelles</span>
                </CardTitle>
                <CardDescription>
                  Vos informations de base et coordonnées
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom</Label>
                    {editing ? (
                      <Input
                        id="prenom"
                        value={profileData.prenom}
                        onChange={(e) => handleChange('prenom', e.target.value)}
                      />
                    ) : (
                      <p className="text-sm font-medium text-foreground px-3 py-2 bg-muted rounded-md">
                        {user?.prenom}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom</Label>
                    {editing ? (
                      <Input
                        id="nom"
                        value={profileData.nom}
                        onChange={(e) => handleChange('nom', e.target.value)}
                      />
                    ) : (
                      <p className="text-sm font-medium text-foreground px-3 py-2 bg-muted rounded-md">
                        {user?.nom}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {editing ? (
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    ) : (
                      <p className="text-sm font-medium text-foreground px-3 py-2 bg-muted rounded-md">
                        {user?.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    {editing ? (
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => handleChange('username', e.target.value)}
                      />
                    ) : (
                      <p className="text-sm font-medium text-foreground px-3 py-2 bg-muted rounded-md">
                        {user?.username}
                      </p>
                    )}
                  </div>
                </div>

                {editing && (
                  <div className="flex items-center space-x-4 pt-4">
                    <Button onClick={handleSave} className="gradient-primary">
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Sécurité</span>
                </CardTitle>
                <CardDescription>
                  Paramètres de sécurité et authentification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Mot de passe</p>
                      <p className="text-sm text-muted-foreground">
                        Dernière modification il y a 30 jours
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Gérer les notifications email et push
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Configurer
                  </Button>
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
            {/* User Summary */}
            <Card className="shadow-elegant">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-20 w-20 bg-primary/20 rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {user?.prenom} {user?.nom}
                    </h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <Badge variant="default" className="gradient-primary">
                    {user?.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Store Access */}
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