import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import database from "@/services/database";
import { useDatabaseMutation } from "@/utilities/useDatabaseMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  GripVertical,
  Trash2,
  Edit3,
  Video,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Eye,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const typeIcons: Record<string, React.ElementType> = {
  video: Video,
  text: FileText,
  quiz: HelpCircle,
};

function SortableModule({
  module,
  courseId,
  onEdit,
  onDelete,
  onAddLesson,
}: {
  module: any;
  courseId: string;
  onEdit: (m: any) => void;
  onDelete: (id: string) => void;
  onAddLesson: (moduleId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const lessons = module.lessons ?? [];
  const sortedLessons = [...lessons].sort(
    (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
  );

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border bg-card">
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          className="cursor-grab text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        <span className="flex-1 text-sm font-medium">{module.title}</span>
        <span className="text-xs text-muted-foreground">
          {lessons.length} leçon{lessons.length !== 1 ? "s" : ""}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onEdit(module)}
        >
          <Edit3 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive"
          onClick={() => onDelete(module.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {expanded && (
        <div className="border-t px-3 pb-3">
          {sortedLessons.length > 0 ? (
            <div className="flex flex-col gap-1 pt-2">
              {sortedLessons.map((lesson: any) => {
                const TypeIcon = typeIcons[lesson.type] ?? FileText;
                return (
                  <Link
                    key={lesson.id}
                    to="/instructor/courses/$courseId/lessons/$lessonId"
                    params={{ courseId, lessonId: lesson.id }}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
                  >
                    <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="flex-1 truncate">{lesson.title}</span>
                    {lesson.is_preview && (
                      <Badge
                        variant="outline"
                        className="px-1.5 py-0 text-[10px]"
                      >
                        <Eye className="mr-1 h-2.5 w-2.5" />
                        Preview
                      </Badge>
                    )}
                    <span className="text-xs capitalize text-muted-foreground">
                      {lesson.type}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="pt-2 text-xs text-muted-foreground">
              Aucune leçon dans ce module
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 gap-1 text-xs"
            onClick={() => onAddLesson(module.id)}
          >
            <Plus className="h-3 w-3" />
            Ajouter une leçon
          </Button>
        </div>
      )}
    </div>
  );
}

function CurriculumEditor() {
  const { courseId } = Route.useParams();
  const queryClient = useQueryClient();

  const [moduleDialog, setModuleDialog] = useState<{
    open: boolean;
    editing?: any;
  }>({ open: false });
  const [lessonDialog, setLessonDialog] = useState<{
    open: boolean;
    moduleId?: string;
  }>({ open: false });
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState("video");

  const {
    createRow: createModule,
    updateRow: updateModule,
    deleteRow: deleteModule,
  } = useDatabaseMutation({ table: "modules" });
  const { createRow: createLesson } = useDatabaseMutation({
    table: "lessons",
  });

  const { data: modulesData, isLoading } = useQuery({
    queryKey: ["database", "modules", "course", courseId],
    queryFn: () =>
      database.getTable({
        from: "modules",
        where: { field: "course_id", operator: "eq", value: courseId },
        orderBy: [{ field: "position", direction: "asc" }],
        include: { lessons: true },
      }),
  });

  const modules = modulesData?.data ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ["database", "modules", "course", courseId],
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = modules.findIndex((m: any) => m.id === active.id);
    const newIndex = modules.findIndex((m: any) => m.id === over.id);
    const reordered = arrayMove(modules, oldIndex, newIndex);

    for (let i = 0; i < reordered.length; i++) {
      if ((reordered[i] as any).position !== i) {
        await updateModule({
          id: (reordered[i] as any).id,
          data: { position: i },
        });
      }
    }
    invalidate();
  };

  const handleSaveModule = async () => {
    if (!moduleTitle.trim()) return;

    try {
      if (moduleDialog.editing) {
        await updateModule({
          id: moduleDialog.editing.id,
          data: { title: moduleTitle.trim() },
        });
        toast.success("Module mis à jour");
      } else {
        await createModule({
          data: {
            course_id: courseId,
            title: moduleTitle.trim(),
            position: modules.length,
          },
        });
        toast.success("Module ajouté");
      }
      invalidate();
      setModuleDialog({ open: false });
      setModuleTitle("");
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur");
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm("Supprimer ce module et toutes ses leçons ?")) return;
    try {
      await deleteModule({ id });
      invalidate();
      toast.success("Module supprimé");
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur");
    }
  };

  const handleSaveLesson = async () => {
    if (!lessonTitle.trim() || !lessonDialog.moduleId) return;

    try {
      const moduleLessons =
        modules.find((m: any) => m.id === lessonDialog.moduleId)?.lessons ?? [];

      await createLesson({
        data: {
          module_id: lessonDialog.moduleId,
          title: lessonTitle.trim(),
          type: lessonType,
          position: (moduleLessons as any[]).length,
        },
      });
      toast.success("Leçon ajoutée");
      invalidate();
      setLessonDialog({ open: false });
      setLessonTitle("");
      setLessonType("video");
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur");
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Chargement...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Curriculum</h2>
          <p className="text-sm text-muted-foreground">
            Organisez vos modules et leçons
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setModuleTitle("");
            setModuleDialog({ open: true });
          }}
        >
          <Plus className="h-4 w-4" />
          Ajouter un module
        </Button>
      </div>

      {modules.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground">
            Aucun module. Ajoutez-en un pour commencer.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={modules.map((m: any) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {modules.map((mod: any) => (
                <SortableModule
                  key={mod.id}
                  module={mod}
                  courseId={courseId}
                  onEdit={(m) => {
                    setModuleTitle(m.title);
                    setModuleDialog({ open: true, editing: m });
                  }}
                  onDelete={handleDeleteModule}
                  onAddLesson={(moduleId) => {
                    setLessonTitle("");
                    setLessonType("video");
                    setLessonDialog({ open: true, moduleId });
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Module dialog */}
      <Dialog
        open={moduleDialog.open}
        onOpenChange={(open) => setModuleDialog({ open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moduleDialog.editing ? "Modifier le module" : "Nouveau module"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="module-title">Titre du module</Label>
            <Input
              id="module-title"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              placeholder="Ex: Introduction"
              onKeyDown={(e) => e.key === "Enter" && handleSaveModule()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModuleDialog({ open: false })}
            >
              Annuler
            </Button>
            <Button onClick={handleSaveModule}>
              {moduleDialog.editing ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson dialog */}
      <Dialog
        open={lessonDialog.open}
        onOpenChange={(open) => setLessonDialog({ open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle leçon</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="lesson-title">Titre de la leçon</Label>
              <Input
                id="lesson-title"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Ex: Premiers pas"
              />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={lessonType} onValueChange={setLessonType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Vidéo</SelectItem>
                  <SelectItem value="text">Texte</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLessonDialog({ open: false })}
            >
              Annuler
            </Button>
            <Button onClick={handleSaveLesson}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute(
  "/instructor/courses/$courseId/curriculum"
)({
  component: CurriculumEditor,
});
