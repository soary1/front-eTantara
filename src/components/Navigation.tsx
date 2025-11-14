import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Book, Share2, Brain, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import logo from "@/logo.jpg";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Charger l'état de connexion
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUsername = localStorage.getItem("username");
    if (token && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    } else {
      setIsLoggedIn(false);
      setUsername(null);
    }
  }, []);

  // Déconnexion locale
  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }).catch(() => {}); // Si non implémenté côté backend

      localStorage.removeItem("authToken");
      localStorage.removeItem("username");
      setIsLoggedIn(false);
      setUsername(null);

      toast({
        title: "Veloma!",
        description: "Déconnexion réussie.",
      });

      navigate("/auth");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  const navLinks = [
    { to: "/library", label: "Boky (Library)", icon: Book },
    { to: "/calendrier-culturel", label: "Calendrier Culturel", icon: Brain },
    { to: "/quiz", label: "Fanontaniana (Quiz)", icon: Brain },
    { to: "/share", label: "Mizara (Share)", icon: Share2 },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-14">
          {/* Left: logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
              <img src={logo} alt="eTantara" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Center: nav links (centered on desktop) */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center space-x-6">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 hover:text-primary transition-colors text-sm ${
                    location.pathname === to
                      ? "text-primary font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: user actions */}
          <div className="ml-4 hidden md:flex items-center">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{username}</span>
                <Link to="/profile">
                  <Button variant="ghost" size="icon" title="Profil">
                    <User size={18} />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleSignOut} title="Déconnexion">
                  <LogOut size={18} />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button className="bg-primary hover:bg-primary/90">Hiditra (Login)</Button>
              </Link>
            )}
          </div>

          {/* Bouton menu mobile */}
          <div className="ml-auto md:ml-4 md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 py-2 ${
                  location.pathname === to
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}

            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 py-2 text-muted-foreground">
                  <User size={18} />
                  {username}
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 py-2 text-muted-foreground"
                >
                  <LogOut size={18} />
                  Hivoaka (Logout)
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Hiditra (Login)
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
