import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer?: string; // caché côté client si non renvoyé
  // champs possibles venant du backend
  options?: string[];
  text?: string;
  type?: string;
}

// Questions par défaut affichées si l'API est vide ou inaccessible
const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Iza no mpanoratra ny angano 'Ibonia'?",
    optionA: "Rajaonarison",
    optionB: "Jean-Luc",
    optionC: "Tsiory",
    optionD: "Haja",
    correctAnswer: "Rajaonarison",
  },
  {
    id: 2,
    question: "Inona no sangan'asan'ny kabary malagasy?",
    optionA: "Fampanjakana",
    optionB: "Fiderana",
    optionC: "Fanolorana teny",
    optionD: "Fampiarahana",
    correctAnswer: "Fanolorana teny",
  },
  {
    id: 3,
    question: "Ny fomban-drazana malagasy ao amin'ny fianakaviana dia antsoina hoe...",
    optionA: "Fanolorana",
    optionB: "Fihavanana",
    optionC: "Fampitahana",
    optionD: "Fampiharana",
    correctAnswer: "Fihavanana",
  },
  {
    id: 4,
    question: "Inona no fitaovana ampiasaina amin'ny kabary?",
    optionA: "Amponga",
    optionB: "Valihatra",
    optionC: "Tsy misy",
    optionD: "Sampona",
    correctAnswer: "Valihatra",
  },
];

const Quiz = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [stoppedEarly, setStoppedEarly] = useState(false);

  // Fonction pour mélanger un tableau (Fisher-Yates shuffle)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Fonction pour mélanger les options d'une question
  const shuffleOptions = (question: Question): Question => {
    // Si la question a un tableau `options` original, le mélanger aussi
    if (question.options && Array.isArray(question.options) && question.options.length > 0) {
      const shuffledOpts = shuffleArray([...question.options]);
      return {
        ...question,
        options: shuffledOpts,
      };
    }
    
    // Sinon, mélanger les optionA/B/C/D
    const options = [
      question.optionA,
      question.optionB,
      question.optionC,
      question.optionD,
    ].filter(Boolean);
    
    const shuffled = shuffleArray(options);
    return {
      ...question,
      optionA: shuffled[0] || question.optionA,
      optionB: shuffled[1] || question.optionB,
      optionC: shuffled[2] || question.optionC,
      optionD: shuffled[3] || question.optionD,
    };
  };

  // Charger les questions du backend
  useEffect(() => {
    console.log("🎯 Component Quiz monté - appel de fetchQuestions");
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      console.log("🔄 Début du fetch des questions...");
      const response = await fetch("/api/quiz");
      console.log("📡 Réponse HTTP reçue:", response.status, response.statusText);
      
      if (!response.ok) {
        console.error("❌ Erreur HTTP:", response.status);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("📥 Données reçues du backend:", data);
      console.log("📊 Nombre de questions:", Array.isArray(data) ? data.length : "N/A");
      
      // Si l'API renvoie vide, utiliser les questions par défaut
      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.warn("⚠️ Pas de données du backend, utilisation des questions par défaut");
        let quizQuestions: Question[] = shuffleArray(DEFAULT_QUESTIONS).map(q => shuffleOptions(q));
        console.log("✅ Questions par défaut chargées:", quizQuestions.length, "questions");
        setQuestions(quizQuestions);
        return;
      }

      // Normaliser les questions du backend au format attendu
      let quizQuestions: Question[] = (data as any[]).map((q: any) => {
        // Si la question a un tableau `options`, la convertir en optionA/B/C/D ET garder options
        if (q.options && Array.isArray(q.options) && q.options.length > 0) {
          return {
            id: q.id || 0,
            question: q.question || q.text || "",
            optionA: q.options[0] || "",
            optionB: q.options[1] || "",
            optionC: q.options[2] || "",
            optionD: q.options[3] || "",
            correctAnswer: q.correctAnswer || "",
            type: q.type,
            text: q.text,
            options: q.options, // Garder le tableau original
          };
        }
        // Sinon, utiliser les champs existants
        return {
          id: q.id || 0,
          question: q.question || "",
          optionA: q.optionA || q.options?.[0] || "",
          optionB: q.optionB || q.options?.[1] || "",
          optionC: q.optionC || q.options?.[2] || "",
          optionD: q.optionD || q.options?.[3] || "",
          correctAnswer: q.correctAnswer || "",
          type: q.type,
          text: q.text,
          options: q.options,
        };
      });

      // Mélanger l'ordre des questions et les options de chaque question
      quizQuestions = shuffleArray(quizQuestions).map(q => shuffleOptions(q));
      console.log("✅ Questions chargées depuis le backend:", quizQuestions.length, "questions");
      console.log("🎯 Premières questions normalisées:", quizQuestions.slice(0, 2));
      setQuestions(quizQuestions);
    } catch (error: any) {
      console.error("❌ Erreur de chargement :", error);
      console.error("📋 Stack trace:", error.stack);
      // fallback local : permet d'avoir toujours un quiz jouable
      let quizQuestions: Question[] = shuffleArray(DEFAULT_QUESTIONS).map(q => shuffleOptions(q));
      console.log("🔄 Fallback: questions par défaut chargées:", quizQuestions.length);
      setQuestions(quizQuestions);
    }
  };

  const handleAnswerSubmit = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false;

    try {
      // Vérifie la réponse via le backend
      const response = await fetch("/api/quiz/reponse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          reponse: selectedAnswer,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        isCorrect = result.correct === true;
      } else {
        // si l'API ne répond pas correctement, tenter une vérification locale
        if (currentQuestion.correctAnswer) {
          isCorrect = selectedAnswer === currentQuestion.correctAnswer;
        }
      }
    } catch (error) {
      console.error("Erreur vérification :", error);
      // Vérification locale si backend hors-service
      if (currentQuestion.correctAnswer) {
        isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      }
    }

    if (isCorrect) {
      setScore((prev) => prev + 1);
      toast({
        title: "Tsara! Correct! 🎉",
        description: "Well done!",
      });
    } else {
      toast({
        title: "Diso 😢",
        description: "Ce n'était pas la bonne réponse.",
        variant: "destructive",
      });
    }

    const nextIndex = currentQuestionIndex + 1;
    setAnsweredQuestions(answeredQuestions + 1);

    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer("");
    } else {
      setShowResults(true);
      await saveQuizResult();
    }
  };

  // Sauvegarde du score
  const saveQuizResult = async () => {
    try {
      const response = await fetch("/api/quiz/resultats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pseudo: localStorage.getItem("username") || "Anonyme",
          score,
          total: questions.length,
        }),
      });
      
      if (response.ok) {
        // Émettre un événement pour que Share.tsx rafraîchisse les points
        window.dispatchEvent(new Event("quiz-completed"));
        console.log("✅ Quiz results saved and points updated");
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du score :", error);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setScore(0);
    setShowResults(false);
    setStoppedEarly(false);
    setAnsweredQuestions(0);
    fetchQuestions();
  };

  // Arrêter le quiz en cours (affiche les résultats sans les sauvegarder)
  const stopQuiz = () => {
    setStoppedEarly(true);
    setShowResults(true);
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <p className="text-xl text-muted-foreground">
                Aucune question disponible pour le moment.
              </p>
              <p className="text-muted-foreground mt-2">Revenez plus tard !</p>
              <details className="text-left mt-4 p-4 bg-secondary rounded text-sm">
                <summary className="cursor-pointer font-semibold">Debug Info</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
                  Vérifiez la console du navigateur (F12) pour voir les logs:
                  - "📥 Données reçues du backend"
                  - "✅ Questions chargées"
                  - "⚠️ Pas de données"
                </pre>
              </details>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  // Supporter plusieurs formats de question :
  // - backend peut renvoyer un tableau `options`
  // - ancien format local utilise optionA..optionD
  const options = (currentQuestion.options && currentQuestion.options.length > 0)
    ? currentQuestion.options
    : [
        currentQuestion.optionA,
        currentQuestion.optionB,
        currentQuestion.optionC,
        currentQuestion.optionD,
      ].filter(Boolean);

  const isFillBlank = !!currentQuestion.text || currentQuestion.type === 'complete';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Fanontaniana Malagasy</h1>
          <p className="text-muted-foreground">
            Testez vos connaissances sur la culture malagasy 🇲🇬
          </p>
        </div>

        {showResults ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-center">
                {stoppedEarly ? "Quiz arrêté" : "Quiz terminé !"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div>
                {stoppedEarly ? (
                  <>
                    <p className="text-4xl font-bold text-primary mb-2">
                      {score}/{answeredQuestions} réponses correctes
                    </p>
                    <p className="text-xl text-muted-foreground">
                      Vous avez répondu à {answeredQuestions} question{answeredQuestions > 1 ? 's' : ''}.
                    </p>
                    <p className="text-xl text-muted-foreground">
                      Taux de réussite : {answeredQuestions > 0 ? Math.round((score / answeredQuestions) * 100) : 0}%
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-6xl font-bold text-primary mb-2">
                      {score}/{questions.length}
                    </p>
                    <p className="text-xl text-muted-foreground">
                      Vous avez réussi {Math.round((score / questions.length) * 100)}%
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-2">
                {stoppedEarly ? (
                  <p className="text-lg font-semibold">Quiz arrêté — vos réponses ne sont pas enregistrées.</p>
                ) : (
                  <>
                    {score === questions.length && (
                      <p className="text-lg font-semibold">
                        🎉 Score parfait ! Tsara be !
                      </p>
                    )}
                    {score >= questions.length * 0.7 && score < questions.length && (
                      <p className="text-lg font-semibold">👏 Très bon travail !</p>
                    )}
                    {score < questions.length * 0.7 && (
                      <p className="text-lg font-semibold">
                        Continuez à apprendre la culture malagasy !
                      </p>
                    )}
                  </>
                )}
              </div>

              <Button onClick={resetQuiz} size="lg" className="mt-4">
                Rejouer
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted-foreground">
                  Question {currentQuestionIndex + 1} sur {questions.length}
                </span>
                <div className="flex items-center space-x-3">
                  <span className="text-primary font-semibold">Score: {score}</span>
                  <Button onClick={stopQuiz} size="sm" className="bg-red-600 hover:bg-red-700 text-white">Arrêter</Button>
                </div>
              </div>
              <CardTitle className="text-2xl">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isFillBlank ? (
                <div className="space-y-3">
                  {currentQuestion.text && (
                    <p className="text-lg text-muted-foreground">{currentQuestion.text}</p>
                  )}
                  
                  {/* Si des options existent (type "complete" avec choix), afficher les options */}
                  {options && options.length > 0 && !currentQuestion.options?.every((o: any) => !o) ? (
                    <RadioGroup
                      value={selectedAnswer}
                      onValueChange={setSelectedAnswer}
                    >
                      <div className="space-y-3">
                        {options.map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer"
                          >
                            <RadioGroupItem value={option} id={`fill-option-${index}`} />
                            <Label
                              htmlFor={`fill-option-${index}`}
                              className="flex-1 cursor-pointer font-medium"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  ) : (
                    /* Sinon, afficher un champ texte libre */
                    <input
                      type="text"
                      value={selectedAnswer}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      className="w-full p-3 border rounded-md"
                      placeholder="Tapez votre réponse ici"
                    />
                  )}
                  
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={!selectedAnswer || selectedAnswer.trim() === ''}
                    className="w-full"
                    size="lg"
                  >
                    Valider la réponse
                  </Button>
                </div>
              ) : (
                <>
                  <RadioGroup
                    value={selectedAnswer}
                    onValueChange={setSelectedAnswer}
                  >
                    <div className="space-y-3">
                      {options.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer"
                        >
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <Label
                            htmlFor={`option-${index}`}
                            className="flex-1 cursor-pointer"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={!selectedAnswer}
                    className="w-full"
                    size="lg"
                  >
                    Valider la réponse
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Quiz;
