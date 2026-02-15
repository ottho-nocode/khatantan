import { useQuery, useQueryClient } from "@tanstack/react-query";
import database from "@/services/database";
import { useAuth } from "@/contexts/Auth";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  Circle,
  RotateCcw,
  Trophy,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface QuizPlayerProps {
  lessonId: string;
  enrollmentId?: string;
}

export function QuizPlayer({ lessonId, enrollmentId }: QuizPlayerProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch quiz
  const { data: quizRow } = useQuery({
    queryKey: ["quiz", lessonId],
    queryFn: async () => {
      const result = await database.getTable({
        from: "quizzes",
        where: { field: "lesson_id", operator: "eq", value: lessonId },
        limit: 1,
      });
      return result.data[0] ?? null;
    },
  });

  const quiz = quizRow as any;

  // Fetch questions with options
  const { data: questionsData } = useQuery({
    queryKey: ["quiz-questions-player", quiz?.id],
    queryFn: () =>
      database.getTable({
        from: "quiz_questions",
        where: { field: "quiz_id", operator: "eq", value: quiz.id },
        orderBy: [{ field: "position", direction: "asc" }],
        include: { quiz_options: true },
      }),
    enabled: !!quiz?.id,
  });

  const questions = (questionsData?.data ?? []) as any[];

  // Fetch previous attempts
  const { data: attemptsData } = useDatabaseQuery({
    from: "quiz_attempts",
    where: {
      operator: "and",
      conditions: [
        { field: "student_id", operator: "eq", value: user?.id ?? "" },
        { field: "quiz_id", operator: "eq", value: quiz?.id ?? "" },
      ],
    },
    orderBy: [{ field: "completed_at", direction: "desc" }],
  });

  const attempts = (attemptsData?.data ?? []) as any[];
  const maxAttempts = quiz?.max_attempts;
  const canAttempt = !maxAttempts || attempts.length < maxAttempts;
  const bestAttempt = attempts.reduce(
    (best: any, a: any) =>
      !best || (a.score ?? 0) > (best.score ?? 0) ? a : best,
    null
  );

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showingResults, setShowingResults] = useState(false);

  const handleSelectOption = (questionId: string, optionId: string, type: string) => {
    setAnswers((prev) => {
      if (type === "multiple_choice") {
        const current = prev[questionId] ?? [];
        return {
          ...prev,
          [questionId]: current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId],
        };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  };

  const handleSubmit = async () => {
    if (!quiz?.id || !user) return;
    setSubmitting(true);
    try {
      // Call RPC submit_quiz
      const { data, error } = await supabase.rpc("submit_quiz", {
        p_quiz_id: quiz.id,
        p_answers: answers,
      });
      if (error) throw error;
      setResult(data);
      setShowingResults(true);
      queryClient.invalidateQueries({
        queryKey: ["database", "quiz_attempts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["database", "lesson_progress"],
      });
      queryClient.invalidateQueries({
        queryKey: ["database", "enrollments"],
      });
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur lors de la soumission");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    setShowingResults(false);
    setCurrentQuestion(0);
  };

  if (!quiz || questions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Ce quiz n'est pas encore disponible.
      </div>
    );
  }

  // Show results
  if (showingResults && result) {
    const passed = result.passed;
    return (
      <div className="flex flex-col items-center gap-6 rounded-lg border p-8 text-center">
        {passed ? (
          <Trophy className="h-16 w-16 text-yellow-500" />
        ) : (
          <AlertTriangle className="h-16 w-16 text-orange-500" />
        )}
        <div>
          <h2 className="text-2xl font-bold">
            {passed ? "Félicitations !" : "Pas tout à fait..."}
          </h2>
          <p className="mt-1 text-muted-foreground">
            {passed
              ? "Vous avez réussi le quiz !"
              : "Vous n'avez pas atteint le score minimum."}
          </p>
        </div>
        <div className="text-4xl font-bold text-primary">
          {result.score}%
        </div>
        <p className="text-sm text-muted-foreground">
          {result.earned_points} / {result.total_points} points · Score minimum
          : {quiz.passing_score}%
        </p>

        <div className="flex gap-3">
          {canAttempt && !passed && (
            <Button onClick={handleRetry} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Réessayer
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Show previous best if exists
  if (!showingResults && bestAttempt?.passed) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <h2 className="text-xl font-bold">Quiz déjà réussi !</h2>
        <p className="text-muted-foreground">
          Meilleur score : {bestAttempt.score}%
        </p>
        {canAttempt && (
          <Button variant="outline" onClick={handleRetry} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Refaire le quiz
          </Button>
        )}
      </div>
    );
  }

  if (!canAttempt) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <XCircle className="mx-auto h-12 w-12 text-destructive/50" />
        <p className="mt-4 text-muted-foreground">
          Nombre maximum de tentatives atteint ({maxAttempts}).
        </p>
        {bestAttempt && (
          <p className="mt-1 text-sm">Meilleur score : {bestAttempt.score}%</p>
        )}
      </div>
    );
  }

  // Quiz taking UI
  const q = questions[currentQuestion];
  const options = [...(q.quiz_options ?? [])].sort(
    (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
  );
  const selectedOptions = answers[q.id] ?? [];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Question {currentQuestion + 1} / {questions.length}
        </span>
        <span className="text-sm text-muted-foreground">
          {answeredCount} / {questions.length} répondues
        </span>
      </div>

      <Progress
        value={((currentQuestion + 1) / questions.length) * 100}
        className="h-2"
      />

      <div className="rounded-lg border p-6">
        <p className="text-base font-medium">{q.question_text}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {q.question_type === "multiple_choice"
            ? "Plusieurs réponses possibles"
            : "Une seule réponse"}
          {" · "}{q.points} point{q.points > 1 ? "s" : ""}
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {options.map((option: any) => {
            const isSelected = selectedOptions.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  handleSelectOption(q.id, option.id, q.question_type)
                }
                className={`flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5 text-primary"
                    : "hover:bg-accent"
                }`}
              >
                {isSelected ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                {option.option_text}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion((c) => c - 1)}
        >
          Précédent
        </Button>

        {currentQuestion < questions.length - 1 ? (
          <Button onClick={() => setCurrentQuestion((c) => c + 1)}>
            Suivant
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting || answeredCount < questions.length}
          >
            {submitting ? "Envoi..." : "Soumettre"}
          </Button>
        )}
      </div>
    </div>
  );
}
