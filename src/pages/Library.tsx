import { useEffect, useState } from "react";
import { Search, Filter, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navigation from "@/components/Navigation";

interface Contenu {
  id: number;
  titre: string;
  description: string;
  typeEvenement?: string;
  region?: string;
  auteur?: string;
  imageUrl?: string;
  categorie?: string; // ajouté - certains endpoints renvoient 'categorie'
}

const Library = () => {
  const [content, setContent] = useState<Contenu[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");

  // Base API (utiliser proxy Vite ou variable d'env)
  const API_ROOT = (import.meta as any).env?.VITE_API_BASE || "/api";

  // Modal local
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<Contenu | null>(null);

  useEffect(() => {
    fetchContent();
    fetchCategories();
  }, []);

  // 🧾 Récupère tous les contenus
  const fetchContent = async () => {
    try {
      const response = await fetch(`${API_ROOT}/contenus`);
      if (!response.ok) throw new Error("Erreur lors du chargement du contenu");
      const data = await response.json();
      setContent(data || []);
    } catch (error) {
      console.error("Erreur fetch contenu :", error);
    }
  };

  // 📚 Récupère les catégories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_ROOT}/contenus/categories`);
      if (!response.ok)
        throw new Error("Erreur lors du chargement des catégories");
      const data = await response.json();

      // Accepter soit un tableau de chaînes, soit un tableau d'objets { nom: string }
      const cats: string[] = (data || []).map((c: any) =>
        typeof c === "string" ? c : c?.nom || c?.name || c?.label || String(c)
      ).filter(Boolean);

      setCategories(cats);
    } catch (error) {
      console.error("Erreur fetch catégories :", error);
    }
  };

  // helper pour récupérer la catégorie réelle d'un item (plusieurs shapes possibles)
  const getItemCategory = (item: Contenu) => {
    return (
      item.typeEvenement ||
      (item as any).categorie ||
      (item as any).categorieNom ||
      (item as any).nomCategorie ||
      (item as any).type ||
      undefined
    );
  };

  // 🔍 Filtres dynamiques
  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const itemCategory = getItemCategory(item);
    const matchesType =
      selectedType === "all" ||
      (itemCategory && itemCategory.toLowerCase() === selectedType.toLowerCase());
    const matchesRegion =
      selectedRegion === "all" ||
      item.region?.toLowerCase() === selectedRegion.toLowerCase();

    return matchesSearch && matchesType && matchesRegion;
  });

  const getTypeBadgeColor = (type?: string) => {
    if (!type) return "bg-secondary";
    const colors: Record<string, string> = {
      tantara: "bg-primary/20 text-primary",
      ohabolana: "bg-accent/20 text-accent-foreground",
      kabary: "bg-secondary text-secondary-foreground",
      lovantsofina: "bg-muted text-muted-foreground",
    };
    return colors[type.toLowerCase()] || "bg-secondary";
  };

  const openModal = async (id: number) => {
    try {
      const res = await fetch(`${API_ROOT}/contenus/${id}`);
      if (!res.ok) throw new Error('Erreur chargement contenu');
      const data = await res.json();
      setModalContent(data);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Erreur ouverture modal:', err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Boky Kolontsaina</h1>
          <p className="text-muted-foreground">
            Explore our collection of Malagasy stories, proverbs, speeches, and
            legends.
          </p>
        </div>

        {/* 🔎 Filtres */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4 flex-wrap">
            {/* Recherche */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-muted-foreground"
                  size={18}
                />
                <Input
                  placeholder="Search stories, proverbs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Catégories */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]">
                <Filter size={18} className="mr-2" />
                <SelectValue placeholder="Content Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {categories.map((cat, idx) => (
                  <SelectItem key={idx} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Région */}

          </div>
        </div>

        {/* 📚 Grille du contenu */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <div key={item.id} onClick={() => openModal(item.id)} className="cursor-pointer">
              <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50">
                {item.imageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.titre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className={getTypeBadgeColor(getItemCategory(item))}>
                      {getItemCategory(item) || "Divers"}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{item.titre}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 mb-3">
                    {item.description?.substring(0, 150) ||
                      "Aucune description disponible."}
                  </p>
                  {item.region && (
                    <p className="text-sm text-muted-foreground">
                      📍 {item.region}
                    </p>
                  )}
                  {item.auteur && (
                    <p className="text-sm text-muted-foreground">
                      ✍️ {item.auteur}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* 🪶 Aucun contenu trouvé */}
        {filteredContent.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">
              Aucun contenu trouvé correspondant à vos filtres.
            </p>
            <p className="text-muted-foreground mt-2">
              Essayez d’ajuster vos critères de recherche.
            </p>
          </div>
        )}

        {/* Modal local pour afficher le détail sans navigation */}
        {isModalOpen && modalContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeModal}>
            <div className="bg-white dark:bg-background rounded-lg max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-xl font-semibold">{modalContent.titre}</h3>
                <div className="flex items-center gap-3">
                  <a
                    href={`/api/contenus/${modalContent.id}/telecharger`}
                    className="inline-flex items-center px-3 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20"
                    title="Télécharger ce contenu"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download className="mr-2" size={16} />
                    Télécharger
                  </a>
                  <button
                    onClick={closeModal}
                    className="text-muted-foreground px-3 py-1 rounded-md hover:bg-muted/10"
                    aria-label="Fermer"
                  >
                    Fermer
                  </button>
                </div>
              </div>
              <div className="p-6 max-h-[80vh] overflow-auto">
                {modalContent.imageUrl && (
                  <div className="mb-4">
                    <img src={modalContent.imageUrl} alt={modalContent.titre} className="w-full h-64 object-cover rounded" />
                  </div>
                )}
                <div className="mb-4 text-muted-foreground">{modalContent.description}</div>
                <div className="prose whitespace-pre-wrap mb-4">{(modalContent as any).contenu || (modalContent as any).texte || 'Contenu complet non disponible.'}</div>
                <div className="flex gap-3">
                  <a className="btn" href={`/api/contenus/${modalContent.id}/telecharger`} target="_blank" rel="noreferrer">Télécharger</a>
                  {(modalContent as any).fichierAudio && (
                    <a className="btn" href={`/api/contenus/${modalContent.id}/audio`} target="_blank" rel="noreferrer">Écouter</a>
                  )}
                  {/* <a className="btn" href={`/library/${modalContent.id}`}>Voir la page</a> */}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
