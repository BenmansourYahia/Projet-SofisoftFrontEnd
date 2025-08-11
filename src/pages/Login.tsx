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
      // Real API call to backend
      const response = await api.post<MyResponse<User>>(endpoints.login, {
        username: credentials.username,
        password: credentials.password
      });

      if (response.data.success) {
        const user = response.data.data;
        const token = response.headers.authorization?.replace('Bearer ', '') || 'token-' + Date.now();
        
        login(user, token);
        
        toast({
          title: 'Connexion réussie',
          description: `Bienvenue ${user.prenom} ${user.nom}`,
        });
        
        navigate('/dashboard');
      } else {
        toast({
          title: 'Échec de connexion',
          description: response.data.message || 'Identifiants incorrects',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Login API Error:', error);
      toast({
        title: 'Erreur de connexion',
        description: error.response?.data?.message || 'Une erreur est survenue lors de la connexion',
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