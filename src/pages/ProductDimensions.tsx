import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Search, 
  Barcode,
  Info,
  RefreshCw,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api, { endpoints } from '@/lib/api';
import { MyResponse, ProductDimension } from '@/types/api';

export const ProductDimensions: React.FC = () => {
  const { toast } = useToast();
  
  const [barcode, setBarcode] = useState('');
  const [productDimensions, setProductDimensions] = useState<ProductDimension | null>(null);
  const [loading, setLoading] = useState(false);

  const searchProductDimensions = async () => {
    if (!barcode.trim()) {
      toast({
        title: 'Code-barres requis',
        description: 'Veuillez saisir un code-barres',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<MyResponse<ProductDimension>>(endpoints.getDims, {
        codeBarres: barcode
      });

      if (response.data.success) {
        setProductDimensions(response.data.data);
        toast({
          title: 'Produit trouvé',
          description: 'Les dimensions du produit ont été récupérées',
        });
      } else {
        setProductDimensions(null);
        toast({
          title: 'Produit non trouvé',
          description: response.data.message || 'Aucun produit trouvé avec ce code-barres',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Product Dimensions API Error:', error);
      setProductDimensions(null);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la recherche',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setBarcode('');
    setProductDimensions(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dimensions des Produits</h1>
            <p className="text-muted-foreground">
              Recherchez les dimensions et caractéristiques des produits par code-barres
            </p>
          </div>
        </div>

        {/* Search Section */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Recherche par Code-barres</span>
            </CardTitle>
            <CardDescription>
              Saisissez le code-barres du produit pour obtenir ses dimensions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="barcode">Code-barres</Label>
                <Input
                  id="barcode"
                  placeholder="Saisissez le code-barres..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchProductDimensions()}
                />
              </div>
              <div className="flex items-end space-x-2">
                <Button onClick={searchProductDimensions} disabled={loading || !barcode.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? 'Recherche...' : 'Rechercher'}
                </Button>
                <Button variant="outline" onClick={clearSearch}>
                  Effacer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {productDimensions && (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Dimensions du Produit</span>
              </CardTitle>
              <CardDescription>
                Caractéristiques et dimensions du produit trouvé
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Product Information */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Code Produit</Label>
                    <div className="text-lg font-semibold">{productDimensions.codeProduit}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Code-barres</Label>
                    <div className="text-lg font-semibold font-mono">{productDimensions.codeBarres}</div>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="space-y-4">
                  {productDimensions.taille && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Taille</Label>
                      <div className="text-lg font-semibold">{productDimensions.taille}</div>
                    </div>
                  )}
                  {productDimensions.couleur && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Couleur</Label>
                      <div className="text-lg font-semibold">{productDimensions.couleur}</div>
                    </div>
                  )}
                  {productDimensions.marque && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Marque</Label>
                      <div className="text-lg font-semibold">{productDimensions.marque}</div>
                    </div>
                  )}
                  {productDimensions.categorie && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Catégorie</Label>
                      <div className="text-lg font-semibold">{productDimensions.categorie}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={clearSearch}>
                  Nouvelle recherche
                </Button>
                <Button>
                  <Info className="h-4 w-4 mr-2" />
                  Plus d'informations
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>Aide</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                • Utilisez le scanner de code-barres ou saisissez manuellement le code
              </p>
              <p>
                • Les dimensions incluent la taille, couleur, marque et catégorie
              </p>
              <p>
                • Appuyez sur Entrée pour lancer la recherche
              </p>
              <p>
                • Utilisez le bouton "Effacer" pour recommencer une nouvelle recherche
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProductDimensions;