/**
 * /patients/[id] — Patient detail page
 * Server Component: fetches patient + records directly from DB (account-scoped).
 * Returns 404 if patient not found or doesn't belong to authenticated account.
 */

import { redirect, notFound } from "next/navigation";
import { prisma } from "@kavach/db";
import { getSessionAccount } from "@/lib/get-session-account";
import PatientDetailClient from "./PatientDetailClient";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props) {
  return { title: `Patient — Kavach` };
}

export default async function PatientDetailPage({ params }: Props) {
  const accountId = await getSessionAccount();
  if (!accountId) redirect(`/auth?next=/patients/${params.id}`);

  const patient = await prisma.patientProfile.findFirst({
    where: { id: params.id, accountId, deletedAt: null },
    select: {
      id: true,
      name: true,
      dateOfBirth: true,
      bloodGroup: true,
      weightKg: true,
      allergies: true,
      records: {
        where: { deletedAt: null },
        orderBy: { recordDate: "desc" },
        select: {
          id: true,
          recordType: true,
          recordDate: true,
          status: true,
          confidenceScore: true,
          judgeVerified: true,
          manuallyVerified: true,
        },
        take: 50,
      },
    },
  });

  if (!patient) notFound();

  const dob = patient.dateOfBirth;
  const age = dob
    ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const serialised = {
    id: patient.id,
    name: patient.name,
    dateOfBirth: dob ? dob.toISOString().split("T")[0] : null,
    age,
    bloodGroup: patient.bloodGroup,
    weightKg: patient.weightKg,
    allergies: patient.allergies,
    records: patient.records.map((r) => ({
      id: r.id,
      recordType: r.recordType,
      recordDate: r.recordDate ? r.recordDate.toISOString().split("T")[0] : null,
      status: r.status,
      confidenceScore: r.confidenceScore,
      judgeVerified: r.judgeVerified,
      manuallyVerified: r.manuallyVerified,
    })),
  };

  return <PatientDetailClient patient={serialised} />;
}