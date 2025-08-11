import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Mail, Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import api, { endpoints } from '@/lib/api';
import { MyResponse, User } from '@/types/api';

export const Login: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Demo mode - simulate successful login with any credentials
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay
      
      const demoUser: User = {
        id: '1',
        username: credentials.username,
        email: 'demo@sofisoft.com',
        nom: 'Utilisateur',
        prenom: 'Demo',
        role: 'Administrateur',
        magasins: [
          { code: 'MAG001', nom: 'Magasin Centre-Ville', adresse: '123 Rue de la Paix', telephone: '01 23 45 67 89', email: 'centre@sofisoft.com' },
          { code: 'MAG002', nom: 'Magasin Banlieue', adresse: '456 Avenue des Champs', telephone: '01 98 76 54 32', email: 'banlieue@sofisoft.com' },
          { code: 'MAG003', nom: 'Magasin Sud', adresse: '789 Boulevard du Midi', telephone: '04 11 22 33 44', email: 'sud@sofisoft.com' }
        ]
      };
      
      const token = 'demo-token-' + Date.now();
      
      login(demoUser, token);
      
      toast({
        title: 'Connexion réussie',
        description: `Bienvenue ${demoUser.prenom} ${demoUser.nom}`,
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Erreur de connexion',
        description: 'Une erreur est survenue lors de la connexion',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">SofiSoft</h1>
          <p className="text-muted-foreground mt-2">
            Plateforme d'analyse retail et gestion de stocks
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Connexion</CardTitle>
            <CardDescription className="text-center">
              Connectez-vous à votre espace de gestion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Votre nom d'utilisateur"
                    value={credentials.username}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Votre mot de passe"
                    value={credentials.password}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full gradient-primary shadow-glow"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Connexion...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Se connecter</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Démo:</strong> Utilisez n'importe quel nom d'utilisateur et mot de passe pour tester
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;