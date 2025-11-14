import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  User as UserIcon,
  Clock,
  TrendingUp,
  Heart,
  Share2,
  BookOpen,
  Calendar,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";

interface ContenuCulturel {
  id: number;
  titre: string;
  description: string;
  contenu?: string;
  region?: string;
  auteur?: string;
  dureeLecture?: number;
  nbVues?: number;
  nbAimes?: number;
  nbPartages?: number;
  typeEvenement?: string;
  imageUrl?: string;
  audioUrl?: string;
  categorie?: string;
  dateCreation?: string;
  motsCles?: string[];
  niveau?: string;
  source?: string;
}

const StoryDetail = () => {
  const { id } = useParams();
  const [content, setContent] = useState<ContenuCulturel | null>(null);
  const [loading, setLoading] = useState(true);

  // Base API (utiliser proxy Vite ou variable d'env)
  const API_ROOT = (import.meta as any).env?.VITE_API_BASE || "/api";

  // Charger le contenu selon l'ID dans l'URL
  useEffect(() => {
    if (id) fetchContent(Number(id));
  }, [id]);

  const fetchContent = async (contentId: number) => {
    try {
      const response = await fetch(`${API_ROOT}/contenus/${contentId}`);
      const text = await response.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        data = { message: text };
      }

      if (!response.ok) {
        console.error(`Erreur HTTP ${response.status}:`, data);
        throw new Error(
          data?.message || response.statusText || `Erreur ${response.status}`
        );
      }

      setContent(data);
    } catch (error) {
      console.error("Erreur chargement contenu :", error);
      setContent(null);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
      tantara: "Tantara (Story)",
      ohabolana: "Ohabolana (Proverb)",
      kabary: "Kabary (Speech)",
      lovantsofina: "Lovantsofina (Legend)",
    };
    return labels[type?.toLowerCase() || ""] || "Contenu Culturel";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>Chargement du contenu...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>Contenu introuvable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 🔙 Retour à la bibliothèque */}
        <Link to="/library">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2" size={18} />
            Revenir à la bibliothèque
          </Button>
        </Link>

        <article>
          {/* 🖼️ Image principale */}
          {content.imageUrl && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={content.imageUrl}
                alt={content.titre}
                className="w-full h-[400px] object-cover"
              />
            </div>
          )}

          {/* 🏷️ Type + Métadonnées */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge className="bg-primary/20 text-primary text-base px-3 py-1">
                {getTypeLabel(content.typeEvenement)}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {content.titre}
            </h1>

            <div className="flex flex-wrap gap-6 text-muted-foreground">
              {content.auteur && (
                <div className="flex items-center gap-2">
                  <UserIcon size={18} />
                  <span>{content.auteur}</span>
                </div>
              )}
              {content.region && (
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  <span>{content.region}</span>
                </div>
              )}
              {content.dateCreation && (
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>{new Date(content.dateCreation).toLocaleDateString("fr-FR")}</span>
                </div>
              )}
              {content.dureeLecture && (
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <span>{content.dureeLecture} min</span>
                </div>
              )}
            </div>

            {/* Engagement Stats */}
            <div className="flex flex-wrap gap-6 mt-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp size={16} />
                <span>{content.nbVues || 0} vues</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Heart size={16} />
                <span>{content.nbAimes || 0} aimes</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Share2 size={16} />
                <span>{content.nbPartages || 0} partages</span>
              </div>
            </div>
            
          </div>

          {/* 🧾 Résumé */}
          {content.description && (
            <Card className="mb-8 bg-secondary/30">
              <CardContent className="p-6">
                <h2 className="font-semibold mb-2">Résumé</h2>
                <p className="text-muted-foreground">{content.description}</p>
              </CardContent>
            </Card>
          )}

          {/* 📖 Corps du texte */}
          {content.contenu && (
            <div className="prose prose-lg max-w-none mb-8">
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                {content.contenu}
              </div>
            </div>
          )}

          {/* 🎧 Audio */}
          {content.audioUrl && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Écouter ce contenu</h3>
                <audio controls className="w-full">
                  <source src={content.audioUrl} type="audio/mpeg" />
                  Votre navigateur ne supporte pas l'audio.
                </audio>
              </CardContent>
            </Card>
          )}

          {/* 📊 Détails supplémentaires */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Informations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen size={20} />
                  Informations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {content.categorie && (
                  <div>
                    <p className="text-sm text-muted-foreground">Catégorie</p>
                    <p className="font-medium">{content.categorie}</p>
                  </div>
                )}
                {content.niveau && (
                  <div>
                    <p className="text-sm text-muted-foreground">Niveau</p>
                    <Badge variant="outline">{content.niveau}</Badge>
                  </div>
                )}
                {content.source && (
                  <div>
                    <p className="text-sm text-muted-foreground">Source</p>
                    <p className="font-medium text-sm">{content.source}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mots-clés */}
            {content.motsCles && content.motsCles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag size={20} />
                    Mots-clés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {content.motsCles.map((mot, idx) => (
                      <Badge key={idx} variant="secondary">
                        {mot}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <Button variant="outline" size="lg" className="flex items-center gap-2">
              <Heart size={20} />
              Aimer
            </Button>
            <Button variant="outline" size="lg" className="flex items-center gap-2">
              <Share2 size={20} />
              Partager
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
};

export default StoryDetail;
