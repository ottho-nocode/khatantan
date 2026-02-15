import { createFileRoute } from "@tanstack/react-router";
import { useDatabaseQuery } from "@/utilities";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { CourseCard } from "@/components/courses/course-card";

function CoursesPage() {
  const [search, setSearch] = useState("");

  const { data: coursesData, isLoading } = useDatabaseQuery({
    from: "courses",
    where: search
      ? {
          operator: "and",
          conditions: [
            { field: "status", operator: "eq", value: "published" },
            { field: "title", operator: "ilike", value: search },
          ],
        }
      : { field: "status", operator: "eq", value: "published" },
    include: { instructor_profiles: { include: { profiles: true } } },
    orderBy: [{ field: "created_at", direction: "desc" }],
    limit: 20,
  });

  return (
    <div className="min-h-screen bg-primary/5 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Tous les cours
          </h1>
          <div className="flex gap-2">
            <select className="rounded-full border border-primary/10 bg-white px-4 py-2 text-sm dark:bg-card">
              <option>Trier par : Popularit&eacute;</option>
              <option>Prix croissant</option>
              <option>Prix d&eacute;croissant</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Filters Sidebar */}
          <div className="col-span-1 hidden md:block">
            <div className="sticky top-24 rounded-xl border border-primary/10 bg-white p-6 dark:bg-card">
              <h3 className="mb-4 font-bold text-foreground">Filtres</h3>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-full pl-10"
                />
              </div>

              <div className="mb-6">
                <h4 className="mb-3 text-sm font-semibold text-foreground">
                  Niveau
                </h4>
                <div className="space-y-2">
                  {["Débutant", "Intermédiaire", "Avancé"].map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2 rounded text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-muted-foreground">
                        {level}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="mb-3 text-sm font-semibold text-foreground">
                  Prix
                </h4>
                <div className="space-y-2">
                  {["Gratuit", "Payant"].map((price) => (
                    <label key={price} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2 rounded text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-muted-foreground">
                        {price}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <Button className="w-full">Filtrer</Button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="col-span-1 md:hidden">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un cours..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-full pl-10"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="col-span-1 md:col-span-3">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-96 animate-pulse rounded-2xl bg-muted"
                    />
                  ))
                : coursesData?.data.map((course: any) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
            </div>

            {!isLoading && coursesData?.data.length === 0 && (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                Aucun cours trouv&eacute;.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_public/courses/")({
  component: CoursesPage,
});
