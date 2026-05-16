/**
 * /dashboard — Caregiver landing page.
 * Server Component: fetches patients with record counts directly from DB.
 * Redirects to /auth if not authenticated.
 */

import { redirect } from "next/navigation";
import { prisma } from "@kavach/db";
import { getSessionAccount } from "@/lib/get-session-account";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "Dashboard — Kavach",
  description: "Manage your family's health records",
};

export default async function DashboardPage() {
  const accountId = await getSessionAccount();
  if (!accountId) redirect("/auth?next=/dashboard");

  const patients = await prisma.patientProfile.findMany({
    where: { accountId, deletedAt: null, isArchived: false },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      dateOfBirth: true,
      bloodGroup: true,
      _count: {
        select: {
          records: { where: { deletedAt: null } },
        },
      },
    },
  });

  // Recent records across all patients (last 5)
  const recentRecords = await prisma.record.findMany({
    where: {
      deletedAt: null,
      patient: { accountId, deletedAt: null },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      recordType: true,
      recordDate: true,
      status: true,
      patientId: true,
      patient: { select: { name: true } },
    },
  });

  const serialisedPatients = patients.map((p) => {
    const dob = p.dateOfBirth;
    const age = dob
      ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;
    return {
      id: p.id,
      name: p.name,
      age,
      bloodGroup: p.bloodGroup,
      recordCount: p._count.records,
    };
  });

  const serialisedRecords = recentRecords.map((r) => ({
    id: r.id,
    recordType: r.recordType,
    recordDate: r.recordDate ? r.recordDate.toISOString().split("T")[0] : null,
    status: r.status,
    patientId: r.patientId,
    patientName: r.patient.name,
  }));

  return (
    <DashboardClient patients={serialisedPatients} recentRecords={serialisedRecords} />
  );
}
