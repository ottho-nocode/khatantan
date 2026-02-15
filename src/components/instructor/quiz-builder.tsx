import { useQuery, useQueryClient } from "@tanstack/react-query";
import database from "@/services/database";
import { useDatabaseMutation } from "@/utilities/useDatabaseMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  CheckCircle2,
  Circle,
  Settings,
} from "lucide-react";

interface QuizBuilderProps {
  lessonId: string;
}

export function QuizBuilder({ lessonId }: QuizBuilderProps) {
  const queryClient = useQueryClient();

  // Fetch or create quiz for this lesson
  const { data: quizData, isLoading: quizLoading } = useQuery({
    queryKey: ["quiz", lessonId],
    queryFn: async () => {
      const result = await database.getTable({
        from: "quizzes",
        where: { field: "lesson_id", operator: "eq", value: lessonId },
        limit: 1,
      });
      if (result.data.length > 0) return result.data[0];
      // Auto-create quiz for the lesson
      return database.createRow({
        table: "quizzes",
        data: {
          lesson_id: lessonId,
          title: "Quiz",
          passing_score: 70,
        },
      });
    },
  });

  const quiz = quizData as any;

  // Fetch questions
  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ["quiz-questions", quiz?.id],
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
  const { updateRow: updateQuiz } = useDatabaseMutation({ table: "quizzes" });
  const {
    createRow: createQuestion,
    updateRow: updateQuestion,
    deleteRow: deleteQuestion,
  } = useDatabaseMutation({ table: "quiz_questions" });
  const {
    createRow: createOption,
    updateRow: updateOption,
    deleteRow: deleteOption,
  } = useDatabaseMutation({ table: "quiz_options" });

  const [showSettings, setShowSettings] = useState(false);
  const [passingScore, setPassingScore] = useState(quiz?.passing_score ?? 70);
  const [maxAttempts, setMaxAttempts] = useState(quiz?.max_attempts ?? null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["quiz-questions", quiz?.id] });
  };

  const handleAddQuestion = async () => {
    if (!quiz?.id) return;
    try {
      const q = await createQuestion({
        data: {
          quiz_id: quiz.id,
          question_text: "Nouvelle question",
          question_type: "single_choice",
          points: 1,
          position: questions.length,
        },
      });
      // Add 2 default options
      await createOption({
        data: {
          question_id: q.id,
          option_text: "Option A",
          is_correct: true,
          position: 0,
        },
      });
      await createOption({
        data: {
          question_id: q.id,
          option_text: "Option B",
          is_correct: false,
          position: 1,
        },
      });
      invalidate();
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur");
    }
  };

  const handleUpdateQuestion = async (
    questionId: string,
    data: Record<string, any>
  ) => {
    await updateQuestion({ id: questionId, data });
    invalidate();
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Supprimer cette question ?")) return;
    await deleteQuestion({ id: questionId });
    invalidate();
  };

  const handleAddOption = async (questionId: string, count: number) => {
    await createOption({
      data: {
        question_id: questionId,
        option_text: "",
        is_correct: false,
        position: count,
      },
    });
    invalidate();
  };

  const handleUpdateOption = async (
    optionId: string,
    data: Record<string, any>
  ) => {
    await updateOption({ id: optionId, data });
    invalidate();
  };

  const handleDeleteOption = async (optionId: string) => {
    await deleteOption({ id: optionId });
    invalidate();
  };

  const handleSaveSettings = async () => {
    if (!quiz?.id) return;
    try {
      await updateQuiz({
        id: quiz.id,
        data: {
          passing_score: passingScore,
          max_attempts: maxAttempts || null,
        },
      });
      toast.success("Paramètres sauvegardés");
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur");
    }
  };

  if (quizLoading || questionsLoading) {
    return <div className="text-muted-foreground">Chargement du quiz...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Settings */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Éditeur de quiz</h2>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="h-3.5 w-3.5" />
          Paramètres
        </Button>
      </div>

      {showSettings && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Score minimum (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Max tentatives (vide = illimité)</Label>
              <Input
                type="number"
                min={1}
                value={maxAttempts ?? ""}
                onChange={(e) =>
                  setMaxAttempts(e.target.value ? Number(e.target.value) : null)
                }
              />
            </div>
          </div>
          <Button size="sm" className="mt-3" onClick={handleSaveSettings}>
            Sauvegarder
          </Button>
        </div>
      )}

      {/* Questions */}
      {questions.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Aucune question.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {questions.map((question: any, qi: number) => {
            const options = [...(question.quiz_options ?? [])].sort(
              (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
            );

            return (
              <div key={question.id} className="rounded-lg border p-4">
                <div className="mb-3 flex items-start gap-2">
                  <span className="mt-1 text-sm font-bold text-muted-foreground">
                    Q{qi + 1}.
                  </span>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={question.question_text}
                      onChange={(e) =>
                        handleUpdateQuestion(question.id, {
                          question_text: e.target.value,
                        })
                      }
                      rows={2}
                      className="text-sm"
                    />
                    <div className="flex gap-4">
                      <Select
                        value={question.question_type}
                        onValueChange={(v) =>
                          handleUpdateQuestion(question.id, {
                            question_type: v,
                          })
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single_choice">
                            Choix unique
                          </SelectItem>
                          <SelectItem value="multiple_choice">
                            Choix multiple
                          </SelectItem>
                          <SelectItem value="true_false">Vrai/Faux</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min={1}
                        className="w-20"
                        value={question.points}
                        onChange={(e) =>
                          handleUpdateQuestion(question.id, {
                            points: Number(e.target.value),
                          })
                        }
                        placeholder="pts"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => handleDeleteQuestion(question.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Options */}
                <div className="ml-6 flex flex-col gap-2">
                  {options.map((option: any) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateOption(option.id, {
                            is_correct: !option.is_correct,
                          })
                        }
                        className="shrink-0"
                      >
                        {option.is_correct ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      <Input
                        value={option.option_text}
                        onChange={(e) =>
                          handleUpdateOption(option.id, {
                            option_text: e.target.value,
                          })
                        }
                        className="h-8 text-sm"
                        placeholder="Texte de l'option"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 text-destructive"
                        onClick={() => handleDeleteOption(option.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit gap-1 text-xs"
                    onClick={() =>
                      handleAddOption(question.id, options.length)
                    }
                  >
                    <Plus className="h-3 w-3" />
                    Ajouter une option
                  </Button>
                </div>

                {/* Explanation */}
                <div className="ml-6 mt-3">
                  <Textarea
                    placeholder="Explication (optionnelle, affichée après réponse)"
                    value={question.explanation ?? ""}
                    onChange={(e) =>
                      handleUpdateQuestion(question.id, {
                        explanation: e.target.value || null,
                      })
                    }
                    rows={1}
                    className="text-xs"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Button className="w-fit gap-2" onClick={handleAddQuestion}>
        <Plus className="h-4 w-4" />
        Ajouter une question
      </Button>
    </div>
  );
}
