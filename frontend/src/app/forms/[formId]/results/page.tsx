"use client";

import { useParams } from "next/navigation";

import { ResultsPage } from "@/features/results/results-page";

export default function FormResultsRoute() {
  const params = useParams<{ formId: string }>();
  const formId = Number(params.formId);

  return <ResultsPage formId={formId} />;
}
