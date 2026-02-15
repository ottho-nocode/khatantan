import { createFileRoute } from "@tanstack/react-router";
import { useDatabaseQuery } from "@/utilities/useDatabaseQuery";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GraduationCap, CheckCircle2, XCircle, Search } from "lucide-react";

function VerifyCertificatePage() {
  const [certNumber, setCertNumber] = useState("");
  const [searching, setSearching] = useState(false);

  const { data, isLoading } = useDatabaseQuery({
    from: "certificates",
    where: searching
      ? { field: "certificate_number", operator: "eq", value: certNumber }
      : { field: "id", operator: "eq", value: "" },
    include: { courses: true, profiles: true },
    limit: 1,
  });

  const certificate = searching ? (data?.data?.[0] as any) : null;
  const searched = searching && !isLoading;

  const handleSearch = () => {
    if (certNumber.trim()) setSearching(true);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="text-center">
        <GraduationCap className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Vérifier un certificat</h1>
        <p className="mt-2 text-muted-foreground">
          Entrez le numéro de certificat pour vérifier son authenticité.
        </p>
      </div>

      <div className="mt-8 flex gap-2">
        <Input
          placeholder="Ex: CERT-2026-0001"
          value={certNumber}
          onChange={(e) => {
            setCertNumber(e.target.value);
            setSearching(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} className="gap-2 shrink-0">
          <Search className="h-4 w-4" />
          Vérifier
        </Button>
      </div>

      {isLoading && searching && (
        <div className="mt-8 text-center text-muted-foreground">
          Recherche...
        </div>
      )}

      {searched && certificate && (
        <div className="mt-8 rounded-lg border bg-green-50 p-6 text-center dark:bg-green-950/20">
          <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
          <p className="mt-3 text-lg font-bold text-green-700 dark:text-green-400">
            Certificat valide
          </p>
          <div className="mt-4 space-y-1 text-sm">
            <p>
              <strong>Cours :</strong> {certificate.courses?.title}
            </p>
            <p>
              <strong>Étudiant :</strong>{" "}
              {certificate.profiles?.display_name}
            </p>
            <p>
              <strong>Délivré le :</strong>{" "}
              {new Date(certificate.issued_at).toLocaleDateString("fr-FR")}
            </p>
            <p>
              <strong>N° :</strong> {certificate.certificate_number}
            </p>
          </div>
        </div>
      )}

      {searched && !certificate && (
        <div className="mt-8 rounded-lg border bg-red-50 p-6 text-center dark:bg-red-950/20">
          <XCircle className="mx-auto h-10 w-10 text-red-500" />
          <p className="mt-3 font-bold text-red-600 dark:text-red-400">
            Certificat introuvable
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vérifiez le numéro et réessayez.
          </p>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/_public/verify-certificate")({
  component: VerifyCertificatePage,
});
