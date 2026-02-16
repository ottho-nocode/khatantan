import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/contexts/Auth";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { PhosphorBadgeIcon } from "@/components/ui/phosphor-badge-icon";
import { Medal, Lock } from "lucide-react";

function BadgesPage() {
  const { user } = useAuth();

  const { data: allBadgesData, isLoading: badgesLoading } = useDatabaseQuery({
    from: "badges",
    orderBy: [{ field: "category", direction: "asc" }],
  });

  const { data: userBadgesData, isLoading: userBadgesLoading } =
    useDatabaseQuery({
      from: "user_badges",
      where: {
        field: "profile_id",
        operator: "eq",
        value: user?.id ?? "",
      },
      include: { badges: true },
    });

  const allBadges = allBadgesData?.data ?? [];
  const earnedBadgeIds = new Set(
    (userBadgesData?.data ?? []).map((ub: any) => ub.badge_id)
  );
  const isLoading = badgesLoading || userBadgesLoading;

  const categoryLabels: Record<string, string> = {
    learning: "Apprentissage",
    social: "Social",
    achievement: "Accomplissement",
    special: "Spécial",
  };

  // Group badges by category
  const grouped = allBadges.reduce(
    (acc: Record<string, any[]>, badge: any) => {
      const cat = badge.category ?? "other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(badge);
      return acc;
    },
    {}
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Mes badges</h1>
        <p className="text-muted-foreground">
          Débloquez des badges en apprenant et en participant.
        </p>
        <p className="mt-1 text-sm font-medium text-primary">
          {earnedBadgeIds.size} / {allBadges.length} débloqués
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        Object.entries(grouped).map(([category, badges]) => (
          <section key={category}>
            <h2 className="mb-3 text-lg font-semibold">
              {categoryLabels[category] ?? category}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(badges as any[]).map((badge) => {
                const earned = earnedBadgeIds.has(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`flex items-start gap-3 rounded-lg border p-4 ${
                      earned ? "bg-card" : "bg-muted/30 opacity-60"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        earned ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      {badge.icon_name ? (
                        <PhosphorBadgeIcon
                          iconName={badge.icon_name}
                          color={
                            earned
                              ? badge.icon_color ?? "#e11d48"
                              : "#9ca3af"
                          }
                          size={24}
                        />
                      ) : badge.icon_url ? (
                        <img
                          src={badge.icon_url}
                          alt=""
                          className="h-6 w-6"
                        />
                      ) : earned ? (
                        <Medal className="h-5 w-5 text-primary" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{badge.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {badge.description}
                      </p>
                      <p className="mt-1 text-xs font-medium text-primary">
                        +{badge.xp_reward} XP
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

export const Route = createFileRoute("/_app/badges")({
  component: BadgesPage,
});
