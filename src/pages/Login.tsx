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
      // Simple API call to backend (no token logic)
      const payload = {
        nom: credentials.username,
        motPasse: credentials.password
      };
  // ...existing code...
      const response = await api.post(endpoints.login, payload);
  // ...existing code...
      if (response.data.success) {
        // Parse stringified JSON from backend
        let parsedData;
        try {
          parsedData = JSON.parse(response.data.data);
        } catch (e) {
          toast({
            title: 'Erreur de parsing',
            description: 'Impossible de lire la réponse du serveur.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        if (!parsedData.user) {
          toast({
            title: 'Réponse inattendue',
            description: 'Utilisateur non trouvé dans la réponse du serveur.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        // Map magasins to expected frontend type
        const user = {
          ...parsedData.user,
          magasins: Array.isArray(parsedData.mags)
            ? parsedData.mags.map((m) => ({
                code: m.codeMagasin,
                nom: m.nomMagasin,
                ...m
              }))
            : []
        };
        login(user); // No token
        toast({
          title: 'Connexion réussie',
          description: `Bienvenue ${user.nom}`,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Échec de connexion',
          description: response.data.message || response.data.data || 'Identifiants incorrects',
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
    <div className="min-h-screen flex items-center justify-center bg-background p-2 sm:p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex flex-col items-center justify-center mb-4">
            <img
              src="/sofisoft-logo-new.png"
              alt="Sofisoft Logo"
              className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 object-contain rounded-full bg-primary/20"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground sr-only">SofiSoft</h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mt-2">
            Plateforme d'analyse de magasins et stocks
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl md:text-3xl text-center">Connexion</CardTitle>
            <CardDescription className="text-center text-xs sm:text-sm md:text-base">
              Connectez-vous à votre espace de gestion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs sm:text-sm md:text-base">Nom d'utilisateur</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Votre nom d'utilisateur"
                    value={credentials.username}
                    onChange={handleChange}
                    className="pl-10 text-xs sm:text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs sm:text-sm md:text-base">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Votre mot de passe"
                    value={credentials.password}
                    onChange={handleChange}
                    className="pl-10 text-xs sm:text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full py-2 sm:py-3 text-xs sm:text-sm md:text-base gradient-primary shadow-glow"
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
      </div>
    </div>
  );
};

export default Login;