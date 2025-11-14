import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ShareQuiz {
  question: string;
  correctAnswer: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

interface ShareTantara {
  title: string;
  content: string;
}

interface ShareOhabolana {
  expression: string;
  meaning: string;
}

const Share = () => {
  const { toast } = useToast();
  const [userPoints, setUserPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");

  const [quizForm, setQuizForm] = useState<ShareQuiz>({
    question: "",
    correctAnswer: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
  });

  const [tantaraForm, setTantaraForm] = useState<ShareTantara>({
    title: "",
    content: "",
  });

  const [ohabolanaForm, setOhabolanaForm] = useState<ShareOhabolana>({
    expression: "",
    meaning: "",
  });

  useEffect(() => {
    fetchUserPoints();
    
    // Listen for quiz completion event to refresh points
    const handleQuizComplete = () => {
      console.log("🏆 Quiz complété - Attendre 500ms avant de rafraîchir les points");
      // Attendre un peu que le backend persiste les points
      setTimeout(() => {
        console.log("🔄 Rafraîchissement des points maintenant...");
        fetchUserPoints();
      }, 500);
    };
    
    window.addEventListener("quiz-completed", handleQuizComplete);
    return () => window.removeEventListener("quiz-completed", handleQuizComplete);
  }, []);

  const fetchUserPoints = async () => {
    try {
      const storedUsername = localStorage.getItem("username");
      const token = localStorage.getItem("authToken");

      if (!storedUsername) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour partager du contenu.",
          variant: "destructive",
        });
        return;
      }

      setUsername(storedUsername);

      // Fetch user points from backend (correct endpoint: /api/user/points)
      console.log("📊 Fetching points for user:", storedUsername);
      const response = await fetch(
        `/api/user/points/${storedUsername}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Points reçus:", data);
        setUserPoints(data.points || 0);
      } else {
        console.warn("⚠️ Erreur lors de la récupération des points:", response.status);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des points :", error);
    }
  };

  const canShare = userPoints >= 100;

  const handleShareQuiz = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canShare) {
      toast({
        title: "Points insuffisants",
        description: `Vous avez besoin de 100 points pour partager. Points actuels : ${userPoints}`,
        variant: "destructive",
      });
      return;
    }

    if (!quizForm.question || !quizForm.correctAnswer) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          username,
          ...quizForm,
        }),
      });

      if (response.ok) {
        toast({
          title: "Succès! 🎉",
          description: "Votre quiz a été partagé avec succès.",
        });
        setQuizForm({
          question: "",
          correctAnswer: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
        });
        fetchUserPoints();
      } else {
        throw new Error("Erreur lors du partage du quiz");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du partage du quiz.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareTantara = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canShare) {
      toast({
        title: "Points insuffisants",
        description: `Vous avez besoin de 100 points pour partager. Points actuels : ${userPoints}`,
        variant: "destructive",
      });
      return;
    }

    if (!tantaraForm.title || !tantaraForm.content) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/tantara/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          username,
          ...tantaraForm,
        }),
      });

      if (response.ok) {
        toast({
          title: "Succès! 🎉",
          description: "Votre histoire a été partagée avec succès.",
        });
        setTantaraForm({ title: "", content: "" });
        fetchUserPoints();
      } else {
        throw new Error("Erreur lors du partage");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du partage de l'histoire.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareOhabolana = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canShare) {
      toast({
        title: "Points insuffisants",
        description: `Vous avez besoin de 100 points pour partager. Points actuels : ${userPoints}`,
        variant: "destructive",
      });
      return;
    }

    if (!ohabolanaForm.expression || !ohabolanaForm.meaning) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/ohabolana/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          username,
          ...ohabolanaForm,
        }),
      });

      if (response.ok) {
        toast({
          title: "Succès! 🎉",
          description: "Votre ohabolana a été partagé avec succès.",
        });
        setOhabolanaForm({ expression: "", meaning: "" });
        fetchUserPoints();
      } else {
        throw new Error("Erreur lors du partage");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du partage de l'ohabolana.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mizara (Partager)</h1>
          <p className="text-muted-foreground">
            Partagez votre savoir sur la culture malgache 🇲🇬
          </p>
        </div>

        {/* Points Display */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Points actuels</p>
                <p className="text-3xl font-bold text-primary">{userPoints}</p>
              </div>
              {canShare ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={24} />
                  <span>Vous pouvez partager</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle size={24} />
                  <span>{100 - userPoints} points manquants</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!canShare && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vous devez avoir au moins 100 points pour partager du contenu. Participez aux quiz pour gagner des points !
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="quiz" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="quiz">📝 Quiz</TabsTrigger>
            <TabsTrigger value="tantara">📖 Tantara</TabsTrigger>
            <TabsTrigger value="ohabolana">💭 Ohabolana</TabsTrigger>
          </TabsList>

          {/* Quiz Tab */}
          <TabsContent value="quiz">
            <Card>
              <CardHeader>
                <CardTitle>Partager un Quiz</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleShareQuiz} className="space-y-6">
                  <div>
                    <Label htmlFor="question">Question *</Label>
                    <Textarea
                      id="question"
                      placeholder="Entrez votre question..."
                      value={quizForm.question}
                      onChange={(e) =>
                        setQuizForm({ ...quizForm, question: e.target.value })
                      }
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="optionA">Option A</Label>
                      <Input
                        id="optionA"
                        placeholder="Option A"
                        value={quizForm.optionA}
                        onChange={(e) =>
                          setQuizForm({ ...quizForm, optionA: e.target.value })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="optionB">Option B</Label>
                      <Input
                        id="optionB"
                        placeholder="Option B"
                        value={quizForm.optionB}
                        onChange={(e) =>
                          setQuizForm({ ...quizForm, optionB: e.target.value })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="optionC">Option C</Label>
                      <Input
                        id="optionC"
                        placeholder="Option C"
                        value={quizForm.optionC}
                        onChange={(e) =>
                          setQuizForm({ ...quizForm, optionC: e.target.value })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="optionD">Option D</Label>
                      <Input
                        id="optionD"
                        placeholder="Option D"
                        value={quizForm.optionD}
                        onChange={(e) =>
                          setQuizForm({ ...quizForm, optionD: e.target.value })
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="correctAnswer">Réponse correcte *</Label>
                    <Input
                      id="correctAnswer"
                      placeholder="Entrez la bonne réponse..."
                      value={quizForm.correctAnswer}
                      onChange={(e) =>
                        setQuizForm({
                          ...quizForm,
                          correctAnswer: e.target.value,
                        })
                      }
                      className="mt-2"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!canShare || isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Partage en cours..." : "Partager le Quiz"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tantara Tab */}
          <TabsContent value="tantara">
            <Card>
              <CardHeader>
                <CardTitle>Partager une Histoire</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleShareTantara} className="space-y-6">
                  <div>
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      placeholder="Titre de l'histoire..."
                      value={tantaraForm.title}
                      onChange={(e) =>
                        setTantaraForm({ ...tantaraForm, title: e.target.value })
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Contenu *</Label>
                    <Textarea
                      id="content"
                      placeholder="Racontez votre histoire..."
                      value={tantaraForm.content}
                      onChange={(e) =>
                        setTantaraForm({
                          ...tantaraForm,
                          content: e.target.value,
                        })
                      }
                      className="mt-2"
                      rows={8}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!canShare || isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Partage en cours..." : "Partager l'Histoire"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ohabolana Tab */}
          <TabsContent value="ohabolana">
            <Card>
              <CardHeader>
                <CardTitle>Partager un Ohabolana</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleShareOhabolana} className="space-y-6">
                  <div>
                    <Label htmlFor="expression">Expression Malgache *</Label>
                    <Input
                      id="expression"
                      placeholder="Entrez l'expression..."
                      value={ohabolanaForm.expression}
                      onChange={(e) =>
                        setOhabolanaForm({
                          ...ohabolanaForm,
                          expression: e.target.value,
                        })
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="meaning">Signification *</Label>
                    <Textarea
                      id="meaning"
                      placeholder="Expliquez la signification..."
                      value={ohabolanaForm.meaning}
                      onChange={(e) =>
                        setOhabolanaForm({
                          ...ohabolanaForm,
                          meaning: e.target.value,
                        })
                      }
                      className="mt-2"
                      rows={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!canShare || isLoading}
                    className="w-full"
                  >
                    {isLoading
                      ? "Partage en cours..."
                      : "Partager l'Ohabolana"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Share;
