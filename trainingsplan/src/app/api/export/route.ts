import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { store } from "@/lib/db";
import { EXERCISES } from "@/lib/plan";

export const dynamic = "force-dynamic";

/** Backup zum Mitnehmen — der Plan liegt im Code, die eigenen Daten hier. */
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "nicht angemeldet" }, { status: 401 });

  const { sessions, sets } = await store.loadUserData(user.id);
  return NextResponse.json(
    {
      exportedAt: new Date().toISOString(),
      user: { email: user.email, startDate: user.startDate },
      exercises: EXERCISES.map(({ id, name, dayType, equipment, targetMuscle }) => ({ id, name, dayType, equipment, targetMuscle })),
      sessions,
      sets,
    },
    { headers: { "Content-Disposition": `attachment; filename="mesocycle-export.json"` } },
  );
}
