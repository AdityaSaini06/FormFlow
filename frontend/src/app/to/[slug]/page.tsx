"use client";

import { useParams } from "next/navigation";

import { PublicFormPage } from "@/features/public-form/public-form-page";

export default function PublicFormRoute() {
  const params = useParams<{ slug: string }>();

  return <PublicFormPage slug={params.slug} />;
}
