import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Book, Calendar, Share2, Brain, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import heroBanner from "@/assets/hero-banner.jpg";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  username: string;
  token: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [dailyProverb, setDailyProverb] = useState<any>(null);
  const [dailyQuiz, setDailyQuiz] = useState<any>(null);
  const [dailyQuestion, setDailyQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answerResult, setAnswerResult] = useState<any>(null);
  const { toast } = useToast();

  // Base API (proxy Vite ou variable d'environnement)
  const API_ROOT = (import.meta as any).env?.VITE_API_BASE || "/api";

  // 🔐 Charger l'utilisateur depuis le localStorage
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const username = localStorage.getItem("username");
    if (token && username) {
      setUser({ username, token });
    } else {
      setUser(null);
    }
  }, []);

  // Features for the homepage (minimal placeholder)
  const features = [
    { icon: Book, title: 'Library', link: '/library', subtitle: 'Stories & Texts', description: 'Explore our collection of cultural stories.' },
    { icon: Calendar, title: 'Calendrier Culturel', link: '/calendrier-culturel', subtitle: 'Calendrier Culturel', description: 'Voir les événements et traditions malgaches par mois.' },
    { icon: Share2, title: 'Share', link: '/share', subtitle: 'Contribute', description: 'Share your own story with the community.' },
    { icon: Brain, title: 'Quiz', link: '/quiz', subtitle: 'Test your knowledge', description: 'Participate in daily quizzes and earn points.' },
  ];

  // Charger le quiz du jour — loguer la réponse brute et normaliser la forme
  const fetchDailyQuiz = async () => {
    try {
      console.log('🔄 Chargement du quiz du jour...');
      // Réinitialiser l'état du quiz
      setSelectedAnswer(null);
      setHasAnswered(false);
      setAnswerResult(null);

      const res = await fetch(`${API_ROOT}/quiz/daily`);
      if (!res.ok) {
        console.warn('Impossible de charger le quiz du jour', res.status);
        setDailyQuiz(null);
        setDailyQuestion(null);
        return;
      }
      const data = await res.json();
      console.debug('raw /api/quiz/daily ->', data);

      // Normalisation: plusieurs formes possibles depuis le backend
      // 1) { questions: [...] } -> prendre la première question
      // 2) { options: [...] } -> objet question directement
      // 3) { type: 'complete', text: '...' } -> fill-in-the-blank
      let quizRoot: any = data || null;
      let questionObj: any = null;

      console.debug('🔍 Raw /api/quiz/daily response:', quizRoot);

      if (!quizRoot) {
        console.warn('⚠️ Quiz du jour: réponse vide');
        setDailyQuiz(null);
        setDailyQuestion(null);
        return;
      }

      if (Array.isArray(quizRoot.questions) && quizRoot.questions.length) {
        console.debug('✅ Trouvé questions array, prenant la première');
        questionObj = quizRoot.questions[0];
      } else if (Array.isArray(quizRoot.options) || quizRoot.type === 'complete' || quizRoot.question || quizRoot.enonce || quizRoot.text) {
        // Peut être déjà une question
        console.debug('✅ Objet est déjà une question');
        questionObj = quizRoot;
      } else if (Array.isArray(quizRoot.items) && quizRoot.items.length) {
        // fallback naming
        console.debug('✅ Trouvé items array, prenant le premier');
        questionObj = quizRoot.items[0];
      }

      // Si la question est une chaîne (cas improbable), wrap
      if (typeof questionObj === 'string') {
        console.debug('ℹ️ Question était une chaîne, wrappant dans objet');
        questionObj = { text: questionObj };
      }

      // Assurer quelques champs utiles
      if (questionObj) {
        // harmoniser le champ texte/énoncé
        questionObj.text = questionObj.text || questionObj.question || questionObj.enonce || '';
        questionObj.options = Array.isArray(questionObj.options) ? questionObj.options : [];
        console.debug('✅ Question normalisée:', { text: questionObj.text, optionsCount: questionObj.options.length, type: questionObj.type });
      } else {
        console.warn('⚠️ Impossible de normaliser la question');
      }

      setDailyQuiz(quizRoot);
      setDailyQuestion(questionObj);
    } catch (err) {
      console.error('Erreur fetchDailyQuiz', err);
      setDailyQuiz(null);
      setDailyQuestion(null);
    }
  };

  useEffect(() => { fetchDailyQuiz(); }, []);

  // 📜 Charger le proverbe du jour depuis ton API eTantara (Spring Boot)
useEffect(() => {
  const fetchDailyProverb = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(
        `${API_URL}/api/contenus?type=ohabolana&limit=1`
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement du proverbe");
      }

      const data = await response.json();
      setDailyProverb(data[0] || null);

    } catch (error) {
      console.error("Erreur chargement proverbe:", error);
    }
  };

  fetchDailyProverb();
}, []);


  return (
    <div>
      <Navigation />

      {/* Hero / Banner (constrained image + translucent white card behind text) */}
      <section className="relative">
        <div className="container mx-auto px-4">
          <div className="mx-auto w-full max-w-full rounded-lg overflow-hidden relative">
            <div className="h-96 md:h-[520px] w-full bg-cover bg-center" style={{ backgroundImage: `url(${heroBanner})` }} />

            {/* Full-size translucent white overlay matching image dimensions */}
            <div className="absolute inset-0 bg-white/75 backdrop-blur-sm flex items-center">
              <div className="px-6 md:px-10 max-w-2xl">
                <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-left" style={{ fontFamily: 'Georgia, Times, serif', color: 'hsl(var(--foreground))' }}>
                  Ohabolana
                </h1>
                {dailyProverb ? (
                  <>
                    <p className="text-2xl md:text-3xl mt-4 font-semibold text-muted-foreground" style={{ color: 'hsl(var(--foreground))' }}>
                      {dailyProverb.titre || dailyProverb.titre || "—"}
                    </p>
                    {dailyProverb.description && (
                      <p className="italic text-sm md:text-base mt-2 text-muted-foreground">{dailyProverb.description.substring(0, 140)}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-lg md:text-xl mt-4 text-muted-foreground" style={{ color: 'hsl(var(--foreground))' }}>
                      Preserving and sharing the rich cultural heritage of Madagascar
                    </p>
                    <p className="italic text-sm md:text-base mt-2 text-muted-foreground">Mitahiry sy mizara ny lovantsofina maha-Malagasy antsika</p>
                  </>
                )}

                <div className="flex items-center gap-4 mt-6 justify-start">
                  <Link to="/library">
                    <Button className="px-6 py-3 rounded-md" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
                      Explore Library
                    </Button>
                  </Link>
                  {/* <Link to="/profile">
                    <Button className="px-5 py-3 rounded-md bg-white text-foreground border border-border" style={{ background: 'hsl(var(--card))' }}>
                      Dashboard
                    </Button>
                  </Link> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      

      {/* 🧭 Features Grid */}
              <section className="container mx-auto px-4 py-16">


        {/* 🧠 Quiz du jour placé en haut de la section Discover Our Heritage */}
        {dailyQuiz && (
          <div className="mb-8">
            <Card className="border-emerald-200">
              <CardContent className="p-6 flex items-start gap-4">
                <Brain className="text-emerald-600 mt-1" size={28} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Quiz du Jour</h3>
                  <p className="text-sm text-muted-foreground mb-2">{dailyQuiz.category || 'Général'} • {dailyQuiz.difficulty || 'Facile'}</p>
                  <p className="text-foreground mb-4">{dailyQuiz.question || dailyQuiz.enonce || 'Question unavailable'}</p>

                  <div>
                    {Array.isArray(dailyQuestion?.options) && dailyQuestion.options.length ? (
                      <div className="space-y-3">
                        {dailyQuestion.options.map((opt: any, idx: number) => {
                          const optStr = String(opt);
                          const isSelected = selectedAnswer === optStr;
                          const isCorrectShown = hasAnswered && answerResult?.correctAnswer && String(answerResult.correctAnswer).trim().toLowerCase() === optStr.trim().toLowerCase();
                          const isWrongSelected = hasAnswered && isSelected && !answerResult?.correct;
                          const base = 'quiz-option p-3 rounded border cursor-pointer select-none';
                          const extra = isCorrectShown ? ' bg-emerald-100 border-emerald-300' : isWrongSelected ? ' bg-red-50 border-red-300' : isSelected ? ' bg-emerald-50' : ' bg-white';

                          return (
                            <div
                              key={idx}
                              className={`${base}${extra}`}
                              onClick={() => { if (!hasAnswered) setSelectedAnswer(optStr); }}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => { if (!hasAnswered && (e.key === 'Enter' || e.key === ' ')) { setSelectedAnswer(optStr); } }}
                            >
                              {optStr}
                            </div>
                          );
                        })}

                        {!hasAnswered ? (
                          <div className="flex gap-3">
                            <Button size="sm" className="bg-emerald-600 text-white" onClick={async () => {
                              if (!selectedAnswer) { toast({ title: 'Réponse requise', description: 'Choisissez une option.', variant: 'destructive' }); return; }
                              try {
                                const qId = dailyQuestion?.id || dailyQuiz?.id;

                                const headers: Record<string,string> = { 'Content-Type': 'application/json' };
                                const token = localStorage.getItem('token') || localStorage.getItem('authToken');
                                if (token) headers['Authorization'] = `Bearer ${token}`;

                                let res = await fetch(`${API_ROOT}/quiz/check`, { method: 'POST', headers, body: JSON.stringify({ questionId: qId, answer: selectedAnswer }) });
                                if (res.status === 404) {
                                  res = await fetch(`${API_ROOT}/quiz/reponse`, { method: 'POST', headers, body: JSON.stringify({ questionId: qId, reponse: selectedAnswer }) });
                                }

                                if (res.status === 401) { toast({ title: 'Non autorisé', description: 'Connectez-vous.', variant: 'destructive' }); return; }

                                if (!res.ok) {
                                  let err: any = null;
                                  try { err = await res.json(); } catch (_) { try { err = await res.text(); } catch (_) { err = null; } }
                                  console.warn('Erreur soumission quiz:', res.status, err);

                                  const errMsg = (err && (err.message || err.error)) || (typeof err === 'string' ? err : null);
                                  if (res.status === 400 && errMsg && /déjà particip/i.test(errMsg)) {
                                    setHasAnswered(true);
                                    setAnswerResult({ correct: false, message: errMsg, alreadyParticipated: true, correctAnswer: err && (err.correctAnswer || err.bonneReponse || err.correct_answer) });
                                    toast({ title: 'Déjà participé', description: 'Vous avez déjà participé au quiz d\'aujourd\'hui.', variant: 'destructive' });
                                    return;
                                  }

                                  toast({ title: 'Erreur', description: errMsg || 'Erreur lors de la vérification de la réponse.', variant: 'destructive' });
                                  return;
                                }

                                const result = await res.json();

                                setHasAnswered(true);
                                setAnswerResult(result);

                                if (result.correct) {
                                  toast({ title: 'Bonne réponse', description: 'Bravo !' });
                                } else {
                                  toast({ title: 'Mauvaise réponse', description: 'Dommage.', variant: 'destructive' });
                                }

                              } catch (err) {
                                console.error(err);
                                toast({ title: 'Erreur', description: 'Impossible de soumettre la réponse.', variant: 'destructive' });
                              }
                            }}>Valider</Button>
                            <Button size="sm" variant="outline" onClick={() => { setSelectedAnswer(null); if (hasAnswered) { setHasAnswered(false); setAnswerResult(null); } }}>Réinitialiser</Button>
                          </div>
                        ) : (
                          <div className="text-sm space-y-4">
                            {answerResult ? (
                              <div>
                                <div>{answerResult.correct ? <span className="text-green-600 font-semibold">Correct ✅</span> : <span className="text-red-600 font-semibold">Incorrect ❌</span>}</div>
                                <div className="mt-1"><strong>Votre réponse:</strong> <span>{selectedAnswer}</span></div>
                                {answerResult.correctAnswer && (<div><strong>Bonne réponse:</strong> <span>{answerResult.correctAnswer}</span></div>)}
                                {answerResult.explanation && (<div className="text-muted-foreground"><strong>Explication:</strong><div>{answerResult.explanation}</div></div>)}
                              </div>
                            ) : (<span>Réponse envoyée.</span>)}
                            <Button size="sm" onClick={fetchDailyQuiz} className="mt-3 w-full">
                              Recharger le Quiz
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      (dailyQuestion?.text || dailyQuestion?.type === 'complete') ? (
                        <div className="space-y-3">
                          {dailyQuestion?.text && <p className="text-lg text-foreground">{dailyQuestion.text}</p>}
                          <input
                            type="text"
                            value={selectedAnswer || ''}
                            onChange={(e) => setSelectedAnswer(e.target.value)}
                            className="w-full p-3 border rounded-md bg-background text-foreground border-border"
                            placeholder="Complétez la sagesse..."
                          />
                          {!hasAnswered ? (
                            <div className="flex gap-3">
                              <Button size="sm" className="bg-emerald-600 text-white" onClick={async () => {
                                if (!selectedAnswer || (typeof selectedAnswer === 'string' && selectedAnswer.trim() === '')) { toast({ title: 'Réponse requise', description: 'Veuillez saisir une réponse.', variant: 'destructive' }); return; }
                                try {
                                  const qId = dailyQuestion?.id || dailyQuiz?.id;
                                  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
                                  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
                                  if (token) headers['Authorization'] = `Bearer ${token}`;

                                  let res = await fetch(`${API_ROOT}/quiz/check`, { method: 'POST', headers, body: JSON.stringify({ questionId: qId, answer: selectedAnswer }) });
                                  if (res.status === 404) {
                                    res = await fetch(`${API_ROOT}/quiz/reponse`, { method: 'POST', headers, body: JSON.stringify({ questionId: qId, reponse: selectedAnswer }) });
                                  }

                                  if (res.status === 401) { toast({ title: 'Non autorisé', description: 'Connectez-vous.', variant: 'destructive' }); return; }

                                  if (!res.ok) {
                                    let err: any = null;
                                    try { err = await res.json(); } catch (_) { try { err = await res.text(); } catch (_) { err = null; } }
                                    toast({ title: 'Erreur', description: (err && (err.message || err.error)) || 'Erreur lors de la vérification de la réponse.', variant: 'destructive' });
                                    return;
                                  }

                                  const result = await res.json();
                                  setHasAnswered(true);
                                  setAnswerResult(result);
                                  if (result.correct) toast({ title: 'Bonne réponse', description: 'Bravo !' });
                                  else toast({ title: 'Mauvaise réponse', description: 'Dommage.', variant: 'destructive' });
                                } catch (err) {
                                  console.error(err);
                                  toast({ title: 'Erreur', description: 'Impossible de soumettre la réponse.', variant: 'destructive' });
                                }
                              }}>Valider</Button>
                              <Button size="sm" variant="outline" onClick={() => { setSelectedAnswer(null); if (hasAnswered) { setHasAnswered(false); setAnswerResult(null); } }}>Réinitialiser</Button>
                            </div>
                          ) : (
                            <div className="text-sm space-y-2">
                              {answerResult ? (
                                <div>
                                  <div>{answerResult.correct ? <span className="text-green-600 font-semibold">Correct ✅</span> : <span className="text-red-600 font-semibold">Incorrect ❌</span>}</div>
                                  <div className="mt-1"><strong>Votre réponse:</strong> <span>{selectedAnswer}</span></div>
                                  {answerResult.correctAnswer && (<div><strong>Bonne réponse:</strong> <span>{answerResult.correctAnswer}</span></div>)}
                                  {answerResult.explanation && (<div className="text-muted-foreground"><strong>Explication:</strong><div>{answerResult.explanation}</div></div>)}
                                </div>
                              ) : (<span>Réponse envoyée.</span>)}
                              <Button size="sm" onClick={fetchDailyQuiz} className="mt-3 w-full">Recharger le Quiz</Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Aucune question disponible pour le moment.</p>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
          Discover Our Heritage
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link key={index} to={feature.link}>
                <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer">
                  <CardContent className="p-6">
                    <Icon className="text-primary mb-4" size={40} />
                    <h3 className="text-xl font-semibold mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {feature.subtitle}
                    </p>
                    <p className="text-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 eTantara. Mitahiry ny kolontsaina Malagasy.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
