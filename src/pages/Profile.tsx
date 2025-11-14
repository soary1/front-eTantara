import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Profil {
  id: number;
  // nom/prenom renvoyés par le backend
  nom?: string;
  prenom?: string;
  nomComplet?: string;
  username?: string;
  email?: string;
  points?: number;
  bio?: string;
  region?: string;
  languePreferee?: string;
}

interface Submission {
  id: number;
  titre: string;
  contenu: string;
  statut: string;
  dateCreation: string;
  raisonRejet?: string;
}

interface QuizAttempt {
  id: number;
  score: number;
  totalQuestions: number;
  dateSoumission: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profil | null>(null);
  const [regions, setRegions] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("authToken");
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!token || !username) {
      setError("Vous devez être connecté pour accéder à votre profil.");
      setLoading(false);
      return;
    }
    fetchProfile();
    fetchRegions();
    fetchSubmissions();
  }, []);

  // 🔹 Charger le profil utilisateur
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = `Erreur ${res.status}: ${res.statusText}`;
        throw new Error(err);
      }
      const data = await res.json();

      // Mapper les champs retournés par le backend vers notre shape frontend
      const mapped: Profil = {
        id: data.id,
        nom: data.nom,
        prenom: data.prenom,
        nomComplet: data.nom ? data.nom + (data.prenom ? ` ${data.prenom}` : "") : (data.username || username || ""),
        username: data.username || username,
        email: data.email,
        points: data.points || 0,
        bio: data.bio || "",
        region: data.region || "",
        languePreferee: data.languePreferee || "",
      };

      setProfile(mapped);
    } catch (error: any) {
      console.error("Erreur profil :", error);
      setError(error.message || "Impossible de charger le profil");
      // Afficher au moins les infos du localStorage si disponibles
      if (username) {
        setProfile({
          id: 0,
          nomComplet: username,
          username: username,
          points: 0,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Charger les régions (optionnel)
  const fetchRegions = async () => {
    try {
      const res = await fetch("/api/contenus/categories");
      const data = await res.json();
      // Extract region names if data is array of objects with .nom property
      const regionNames = Array.isArray(data)
        ? data.map((r: any) => (typeof r === "string" ? r : r.nom || r.description || ""))
        : [];
      setRegions(regionNames);
    } catch (error) {
      console.error("Erreur régions :", error);
    }
  };

  // 🔹 Charger les soumissions utilisateur
  const fetchSubmissions = async () => {
    try {
      const res = await fetch(
        `/api/contenus/utilisateur/${username}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      } else if (res.status === 404) {
        setSubmissions([]);
      }
    } catch (error) {
      console.error("Erreur soumissions :", error);
      setSubmissions([]);
    }
  };

  // quiz history removed — no longer fetched or displayed

  // 🔹 Mettre à jour le profil
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error("Erreur mise à jour profil");

      toast({
        title: "Profil mis à jour ✅",
        description: "Vos informations ont été enregistrées.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      en_attente: "bg-yellow-500/20 text-yellow-700",
      approuve: "bg-green-500/20 text-green-700",
      rejete: "bg-red-500/20 text-red-700",
    };
    return colors[status] || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="border-destructive">
            <CardContent className="p-8 text-center space-y-4">
              <p className="text-lg font-semibold text-destructive">{error}</p>
              <p className="text-sm text-muted-foreground">Détails: Vérifiez que le serveur est en cours d'exécution et que vous êtes connecté.</p>
              <Button onClick={() => navigate("/auth")}>Aller à la connexion</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          Profil introuvable.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Mon Profil</h1>

        <Card className="mb-6">
          <CardContent className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-semibold text-primary">
                {profile.nomComplet ? profile.nomComplet.charAt(0).toUpperCase() : (profile.username ? profile.username.charAt(0).toUpperCase() : "U")}
              </div>
              <div>
                <p className="text-lg font-semibold">{profile.nomComplet || profile.username}</p>
                {profile.username && (
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                )}
                {profile.email && (
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground">Points</p>
              <p className="text-3xl font-bold text-primary">{profile.points ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="submissions">Soumissions</TabsTrigger>
            </TabsList>

          {/* --- PROFIL --- */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Modifier le profil</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomComplet">Nom complet</Label>
                    <Input
                      id="nomComplet"
                      value={profile.nomComplet || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, nomComplet: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biographie</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      placeholder="Parlez un peu de vous..."
                      value={profile.bio || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, bio: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Région</Label>
                    <Input
                      id="region"
                      placeholder="Entrez votre région (ex: Analamanga)"
                      value={profile.region || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, region: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Langue préférée</Label>
                    <Select
                      value={profile.languePreferee || "mg"}
                      onValueChange={(val) =>
                        setProfile({ ...profile, languePreferee: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mg">Malagasy</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? "Mise à jour..." : "Enregistrer"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- SOUMISSIONS --- */}
          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Mes Soumissions</CardTitle>
                <CardDescription>Vos contributions culturelles</CardDescription>
              </CardHeader>
              <CardContent>
                {submissions.length > 0 ? (
                  <div className="space-y-4">
                    {submissions.map((s) => (
                      <div key={s.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{s.titre}</h3>
                          <Badge className={getStatusColor(s.statut)}>
                            {s.statut}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {s.contenu}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Soumis le :{" "}
                          {new Date(s.dateCreation).toLocaleDateString()}
                        </p>
                        {s.raisonRejet && (
                          <p className="text-sm text-destructive mt-2">
                            Motif : {s.raisonRejet}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-6">
                    Aucune soumission pour le moment.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
