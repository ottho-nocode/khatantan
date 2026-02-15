import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/contexts/Auth";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { GraduationCap, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function CertificatesPage() {
  const { user, profile } = useAuth();

  const { data, isLoading } = useDatabaseQuery({
    from: "certificates",
    where: { field: "student_id", operator: "eq", value: user?.id ?? "" },
    include: { courses: true },
    orderBy: [{ field: "issued_at", direction: "desc" }],
  });

  const certificates = data?.data ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Mes Certificats
        </h1>
        <p className="text-muted-foreground">
          Valorisez vos r&eacute;ussites et partagez vos comp&eacute;tences
          acquises.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 py-16">
          <GraduationCap className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">Aucun certificat</p>
          <p className="text-sm text-muted-foreground">
            Compl&eacute;tez un cours &agrave; 100% pour obtenir votre
            certificat.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {certificates.map((cert: any) => {
            const issuedDate = cert.issued_at
              ? new Date(cert.issued_at).toLocaleDateString("fr-FR")
              : "—";

            return (
              <div
                key={cert.id}
                className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm dark:bg-card"
              >
                {/* Gradient header */}
                <div className="flex flex-col items-center justify-center bg-gradient-to-br from-primary to-pink-600 px-6 py-8 text-white">
                  <GraduationCap className="mb-3 h-10 w-10 text-white/80" />
                  <h3 className="text-sm font-bold uppercase tracking-widest">
                    Certificat de R&eacute;ussite
                  </h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/70">
                    Khatantan Academy
                  </p>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                  <p className="text-xs text-muted-foreground">
                    D&eacute;cern&eacute; &agrave;
                  </p>
                  <h4 className="mt-1 font-serif text-xl font-bold text-foreground">
                    {profile?.display_name ?? "—"}
                  </h4>

                  <p className="mt-3 text-xs text-muted-foreground">
                    Pour avoir compl&eacute;t&eacute; avec succ&egrave;s le
                    cours
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                    {cert.courses?.title ?? "Cours"}
                  </span>

                  {/* Stats */}
                  <div className="mt-6 flex items-center justify-center gap-6 text-center">
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {issuedDate}
                      </p>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        Date
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">—</p>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        Dur&eacute;e
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">
                        {cert.score ?? "—"}%
                      </p>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        Score
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex items-center gap-2">
                    {cert.pdf_url ? (
                      <a
                        href={cert.pdf_url}
                        target="_blank"
                        rel="noopener"
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          size="sm"
                        >
                          <Download className="h-4 w-4" />
                          T&eacute;l&eacute;charger PDF
                        </Button>
                      </a>
                    ) : (
                      <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        size="sm"
                        disabled
                      >
                        <Download className="h-4 w-4" />
                        T&eacute;l&eacute;charger PDF
                      </Button>
                    )}
                    <Button variant="ghost" size="icon-sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/_app/certificates")({
  component: CertificatesPage,
});
