"use client";

import { useParams } from "next/navigation";

import { BuilderPage } from "@/features/builder/builder-page";

export default function FormBuilderRoute() {
  const params = useParams<{ formId: string }>();
  const formId = Number(params.formId);

  return <BuilderPage formId={formId} />;
}
