import { createFileRoute } from "@tanstack/react-router";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { Trophy, Medal, Award } from "lucide-react";

function LeaderboardPage() {
  const { data, isLoading } = useDatabaseQuery({
    from: "leaderboard",
    orderBy: [{ field: "rank", direction: "asc" }],
    limit: 100,
  });

  const entries = data?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-3">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h1 className="text-2xl font-bold">Classement</h1>
      </div>
      <p className="mt-1 text-muted-foreground">
        Les apprenants les plus actifs de la plateforme.
      </p>

      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
            Aucun classement disponible pour le moment.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry: any, index: number) => {
              const rank = entry.rank ?? index + 1;
              return (
                <div
                  key={entry.profile_id}
                  className={`flex items-center gap-4 rounded-lg border p-3 ${
                    rank <= 3 ? "bg-accent/30" : ""
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                    {rank === 1 ? (
                      <Trophy className="h-6 w-6 text-yellow-500" />
                    ) : rank === 2 ? (
                      <Medal className="h-6 w-6 text-gray-400" />
                    ) : rank === 3 ? (
                      <Award className="h-6 w-6 text-amber-600" />
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">
                        #{rank}
                      </span>
                    )}
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {entry.avatar_url ? (
                      <img
                        src={entry.avatar_url}
                        alt=""
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      entry.display_name?.charAt(0)?.toUpperCase() ?? "?"
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {entry.display_name ?? "Anonyme"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.courses_completed ?? 0} cours complétés
                      {entry.badge_count > 0 &&
                        ` · ${entry.badge_count} badge${entry.badge_count > 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">
                      {entry.xp ?? 0} XP
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_public/leaderboard")({
  component: LeaderboardPage,
});
