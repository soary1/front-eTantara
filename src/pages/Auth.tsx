import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Base API — utilise VITE_API_BASE si défini, sinon proxy Vite en dev (/api/auth)
  const API_BASE = (import.meta as any).env?.VITE_API_BASE || "/api/auth";

  const [tab, setTab] = useState("signin");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [alert, setAlert] = useState<{ type: "success" | "danger"; message: string } | null>(null);

  // Animation d’entrée
  useEffect(() => {
    const card = document.querySelector(".card");
    if (card) {
      card.classList.add("animate-fade-in");
    }
  }, []);

  // Connexion
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      setAlert({ type: "danger", message: "Veuillez remplir tous les champs." });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      // Lire la réponse de manière robuste (texte -> tenter JSON)
      const text = await response.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        // si ce n'est pas du JSON, exposer le texte brut dans data.message
        data = { message: text };
      }

      if (!response.ok) {
        throw new Error(data?.message || response.statusText || "Erreur de connexion");
      }

      if (data?.token?.trim()) {
        const cleanToken = data.token.trim();
        localStorage.setItem("authToken", cleanToken);
        localStorage.setItem("username", data.username || email);

        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur eTantara !",
        });

        setAlert({ type: "success", message: "Connexion réussie ! Redirection..." });

        setTimeout(() => navigate("/"), 1500);
      } else {
        throw new Error(data?.message || "Token invalide dans la réponse");
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      setAlert({
        type: "danger",
        message: error.message || "Erreur de connexion.",
      });
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Inscription
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password || !fullName) {
      setAlert({ type: "danger", message: "Tous les champs sont requis." });
      setLoading(false);
      return;
    }

    try {
      // Préparer payload attendu par AuthController
      const nameParts = fullName.trim().split(/\s+/);
      const nom = nameParts[0] || fullName;
      const prenom = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
      const username = email.includes("@") ? email.split("@")[0] : email;

      const payload = {
        nom,
        prenom,
        username,
        email,
        password,
      };

      const response = await fetch(`${API_BASE}/register-no-validation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        data = { message: text };
      }

      if (!response.ok) {
        throw new Error(data?.message || response.statusText || "Erreur lors de l'inscription");
      }

      toast({
        title: "Compte créé",
        description: "Bienvenue dans la communauté eTantara !",
      });
      setAlert({
        type: "success",
        message: "Votre compte a été créé avec succès !",
      });
      setTab("signin");
    } catch (error: any) {
      console.error("Erreur inscription:", error);
      setAlert({ type: "danger", message: error.message || "Erreur lors de la création du compte." });
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 card transition-opacity duration-700">
        <CardHeader>
          <CardTitle className="text-3xl text-center text-primary">eTantara</CardTitle>
          <CardDescription className="text-center">
            Découvrez, partagez et préservez la culture malagasy 🌺
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Alerte */}
          {alert && (
            <div
              className={`flex items-center gap-2 mb-4 p-3 rounded-md ${
                alert.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {alert.type === "success" ? (
                <CheckCircle size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <span>{alert.message}</span>
            </div>
          )}

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>

            {/* Onglet Connexion */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email / Nom d'utilisateur</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Votre mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i> Connexion...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" /> Se connecter
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Onglet Inscription */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="fullname">Nom complet</Label>
                  <Input
                    id="fullname"
                    type="text"
                    placeholder="Votre nom complet"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password-signup">Mot de passe</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="Créer un mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    "Création..."
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" /> Créer un compte
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
