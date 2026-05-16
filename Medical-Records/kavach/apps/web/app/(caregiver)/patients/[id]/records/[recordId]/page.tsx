/**
 * /patients/[id]/records/[recordId] — Record detail page
 * Server Component: fetches record + extracted fields (account-scoped).
 * 404 if record/patient doesn't belong to the authenticated account.
 */

import { redirect, notFound } from "next/navigation";
import { prisma } from "@kavach/db";
import { getSessionAccount } from "@/lib/get-session-account";
import RecordDetailClient from "./RecordDetailClient";

type Props = { params: { id: string; recordId: string } };

export async function generateMetadata({ params }: Props) {
  return { title: "Record Detail — Kavach" };
}

export default async function RecordDetailPage({ params }: Props) {
  const accountId = await getSessionAccount();
  if (!accountId) redirect(`/auth?next=/patients/${params.id}/records/${params.recordId}`);

  const record = await prisma.record.findFirst({
    where: {
      id: params.recordId,
      deletedAt: null,
      patient: { id: params.id, accountId, deletedAt: null },
    },
    select: {
      id: true,
      patientId: true,
      recordType: true,
      recordDate: true,
      status: true,
      confidenceScore: true,
      judgeVerified: true,
      manuallyVerified: true,
      correctionNote: true,
      rawFileUrl: true,
      createdAt: true,
      patient: { select: { name: true } },
      extractedFields: {
        orderBy: [{ isLowConfidence: "desc" }, { fieldName: "asc" }],
        select: {
          id: true,
          fieldName: true,
          rawValue: true,
          normalizedValue: true,
          unit: true,
          referenceRange: true,
          confidence: true,
          isLowConfidence: true,
          correctedValue: true,
          correctedAt: true,
        },
      },
    },
  });

  if (!record) notFound();

  const serialised = {
    id: record.id,
    patientId: record.patientId,
    patientName: record.patient.name,
    recordType: record.recordType,
    recordDate: record.recordDate ? record.recordDate.toISOString().split("T")[0] : null,
    status: record.status,
    confidenceScore: record.confidenceScore,
    judgeVerified: record.judgeVerified,
    manuallyVerified: record.manuallyVerified,
    correctionNote: record.correctionNote,
    rawFileUrl: record.rawFileUrl,
    createdAt: record.createdAt.toISOString(),
    extractedFields: record.extractedFields.map((f) => ({
      id: f.id,
      fieldName: f.fieldName,
      rawValue: f.rawValue,
      normalizedValue: f.normalizedValue,
      unit: f.unit,
      referenceRange: f.referenceRange,
      confidence: f.confidence,
      isLowConfidence: f.isLowConfidence,
      correctedValue: f.correctedValue,
      correctedAt: f.correctedAt ? f.correctedAt.toISOString() : null,
    })),
  };

  return <RecordDetailClient record={serialised} />;
}
