/**
 * /patients — Patient list page
 * Server Component: fetches patient data directly from DB (account-scoped).
 * Redirects to /auth if not authenticated.
 */

import { redirect } from "next/navigation";
import { prisma } from "@kavach/db";
import { getSessionAccount } from "@/lib/get-session-account";
import PatientListClient from "./PatientListClient";

export const metadata = {
  title: "Patients — Kavach",
  description: "Manage your family members' medical records",
};

export default async function PatientsPage() {
  const accountId = await getSessionAccount();
  if (!accountId) redirect("/auth?next=/patients");

  const patients = await prisma.patientProfile.findMany({
    where: { accountId, deletedAt: null, isArchived: false },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      dateOfBirth: true,
      bloodGroup: true,
      allergies: true,
      _count: { select: { records: { where: { deletedAt: null } } } },
    },
  });

  const serialised = patients.map((p) => {
    const dob = p.dateOfBirth;
    const age = dob
      ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;
    return {
      id: p.id,
      name: p.name,
      dateOfBirth: dob ? dob.toISOString().split("T")[0] : null,
      age,
      bloodGroup: p.bloodGroup,
      allergies: p.allergies,
      recordCount: p._count.records,
    };
  });

  return <PatientListClient initialPatients={serialised} />;
}
