'use client';

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HorizontalNavbar } from "@/components/HorizontalNavbar";
import { AchievementsSection } from "@/components/AchievementsSection";
import { ReadingStreak } from "@/components/ReadingStreak";
import { AmbientSoundCard } from "@/components/AmbientSoundCard";
import { ReminderCard } from "@/components/ReminderCard";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import { setSound, togglePlay, AmbientSoundType } from "@/lib/features/audioSlice";

export default function DashboardPage() {
  const router = useRouter();
  const { loading, isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isEmailVerified = user?.email_confirmed_at !== null && user?.email_confirmed_at !== undefined;

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isEmailVerified) {
      router.push("/");
    }
  }, [loading, isAuthenticated, isEmailVerified, router]);

  if (loading) return null;
  if (!isAuthenticated) return null;
  if (!isEmailVerified) return null;

  return <DashboardHome />;
}

type Testament = "old" | "new";
type ActivityItem =
  | {
      type: "read";
      at: string;
      version_code: string;
      book_slug: string;
      chapter_number: number;
      label: string;
      badge: "LEÍDO";
      color: "blue";
    }
  | {
      type: "bookmark";
      at: string;
      version_code: string;
      book_slug: string;
      chapter_number: number;
      verse_number: number;
      label: string;
      badge: "GUARDADO";
      color: "amber";
    }
  | {
      type: "favorite";
      at: string;
      version_code: string;
      book_slug: string;
      chapter_number: number;
      label: string;
      badge: "FAVORITO";
      color: "purple";
    };

function timeAgoEs(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} horas`;
  const days = Math.floor(hrs / 24);
  return `Hace ${days} días`;
}

function computeStreakUtc(days: string[]) {
  const set = new Set(days);
  const cur = new Date();
  cur.setUTCHours(0, 0, 0, 0);
  let count = 0;
  while (set.has(cur.toISOString().slice(0, 10))) {
    count += 1;
    cur.setTime(cur.getTime() - 86400000);
  }
  return count;
}

function DashboardHome() {
  const { user } = useAppSelector((s) => s.auth);
  // Safely select audio state with a fallback
  const audioState = useAppSelector((s) => s.audio);
  const currentSound = audioState?.currentSound || 'none';
  
  const dispatch = useAppDispatch();
  const userId = user?.id;

  const [loading, setLoading] = useState(true);
  const [preferredVersion, setPreferredVersion] = useState<string>("rv1960");
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("09:00");

  const [streak, setStreak] = useState(0);
  const [chaptersRead, setChaptersRead] = useState(0);
  const [totalChapters, setTotalChapters] = useState(1189);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [activeDays, setActiveDays] = useState(0);

  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [bookNames, setBookNames] = useState<Map<string, { name: string; testament: Testament }>>(new Map());

  const [avatarFailed, setAvatarFailed] = useState(false);

  const userName = (user?.user_metadata as any)?.name || "Usuario";
  const userEmail = user?.email || "";
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString("es-ES", { month: "long", year: "numeric" }) : "";

  const isGoogleUser =
    (user as any)?.app_metadata?.provider === "google" ||
    ((user as any)?.identities ?? []).some((i: any) => i?.provider === "google") ||
    false;

  const meta = (user?.user_metadata as any) ?? {};
  const avatarUrlCandidate =
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    (typeof meta.avatar === "string" && meta.avatar) ||
    null;

  const avatarUrl = isGoogleUser && !avatarFailed ? avatarUrlCandidate : null;

  const progressPercent = useMemo(() => {
    if (!totalChapters) return 0;
    return Math.round((chaptersRead / totalChapters) * 1000) / 10;
  }, [chaptersRead, totalChapters]);


  const nextReading = useMemo(() => {
    // fallback
    const fallback = { label: "Génesis 1", href: `/leer/${preferredVersion}/genesis/1` };
    const lastRead = activity.find((a) => a.type === "read") as ActivityItem | undefined;
    if (!lastRead || lastRead.type !== "read") return fallback;
    // Intentar siguiente capítulo en el mismo libro
    return {
      label: `${bookNames.get(`${lastRead.version_code}:${lastRead.book_slug}`)?.name || lastRead.book_slug} ${lastRead.chapter_number + 1}`,
      href: `/leer/${lastRead.version_code}/${lastRead.book_slug}/${lastRead.chapter_number + 1}`,
    };
  }, [activity, preferredVersion, bookNames]);

  useEffect(() => {
    let cancelled = false;

    const ensureSettings = async () => {
      if (!userId) return;
      const { data } = await supabase
        .from("user_settings")
        .select("preferred_version_code,sounds_enabled,reminders_enabled,reminder_time")
        .eq("user_id", userId)
        .maybeSingle();

      const row = data as any;
      if (row) {
        if (cancelled) return;
        setPreferredVersion(row.preferred_version_code);
        setSoundsEnabled(!!row.sounds_enabled);
        setRemindersEnabled(!!row.reminders_enabled);
        setReminderTime(String(row.reminder_time).slice(0, 5));
        return;
      }

      // Usar upsert para evitar 409 (React dev puede ejecutar efectos 2 veces)
      await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: userId,
            preferred_version_code: "rv1960",
            sounds_enabled: true,
            reminders_enabled: true,
            reminder_time: "09:00",
          },
          { onConflict: "user_id" }
        );
    };

    ensureSettings();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!userId) return;
      setLoading(true);

      // Racha / días activos
      const { data: daysRows } = await supabase
        .from("user_reading_days")
        .select("day", { count: "exact" })
        .eq("user_id", userId)
        .order("day", { ascending: false })
        .limit(120);

      const days = (daysRows ?? []) as Array<{ day: string }>;
      const streakValue = computeStreakUtc(days.map((d) => d.day));
      const activeDaysCount = days.length;

      // Capítulos leídos (version preferida)
      const { count: readCount } = await supabase
        .from("user_chapter_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("version_code", preferredVersion);

      // Total capítulos (version preferida)
      const { count: totalCount } = await supabase
        .from("bible_chapters")
        .select("*", { count: "exact", head: true })
        .eq("version_code", preferredVersion);

      // Versículos guardados
      const { count: bmCount } = await supabase
        .from("user_verse_bookmarks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Actividad reciente (merge)
      const [{ data: reads }, { data: bms }, { data: favs }] = await Promise.all([
        supabase
          .from("user_chapter_progress")
          .select("version_code,book_slug,chapter_number,last_read_at")
          .eq("user_id", userId)
          .order("last_read_at", { ascending: false })
          .limit(10),
        supabase
          .from("user_verse_bookmarks")
          .select("version_code,book_slug,chapter_number,verse_number,created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("user_chapter_favorites")
          .select("version_code,book_slug,chapter_number,created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const items: ActivityItem[] = [
        ...((reads ?? []) as any[]).map((r) => ({
          type: "read" as const,
          at: r.last_read_at,
          version_code: r.version_code,
          book_slug: r.book_slug,
          chapter_number: r.chapter_number,
          label: "",
          badge: "LEÍDO" as const,
          color: "blue" as const,
        })),
        ...((bms ?? []) as any[]).map((r) => ({
          type: "bookmark" as const,
          at: r.created_at,
          version_code: r.version_code,
          book_slug: r.book_slug,
          chapter_number: r.chapter_number,
          verse_number: r.verse_number,
          label: "",
          badge: "GUARDADO" as const,
          color: "amber" as const,
        })),
        ...((favs ?? []) as any[]).map((r) => ({
          type: "favorite" as const,
          at: r.created_at,
          version_code: r.version_code,
          book_slug: r.book_slug,
          chapter_number: r.chapter_number,
          label: "",
          badge: "FAVORITO" as const,
          color: "purple" as const,
        })),
      ]
        .filter((i) => !!i.at)
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, 8);

      // Mapear nombres de libros/testamento para los items
      let names = new Map<string, { name: string; testament: Testament }>();
      if (items.length > 0) {
        const versionCodes = Array.from(new Set(items.map((i) => i.version_code)));
        const { data: books } = await supabase
          .from("bible_books")
          .select("version_code,slug,name,testament")
          .in("version_code", versionCodes);
        names = new Map(
          (books ?? []).map((b: any) => [`${b.version_code}:${b.slug}`, { name: b.name, testament: b.testament }])
        );
      }

      const labeled = items.map((i) => {
        const meta = names.get(`${i.version_code}:${i.book_slug}`);
        const book = meta?.name || i.book_slug;
        if (i.type === "bookmark") {
          return { ...i, label: `${book} ${i.chapter_number}:${i.verse_number}` };
        }
        return { ...i, label: `${book} ${i.chapter_number}` };
      });

      if (cancelled) return;
      setStreak(streakValue);
      setActiveDays(activeDaysCount);
      setChaptersRead(readCount ?? 0);
      setTotalChapters(totalCount ?? 1189);
      setBookmarksCount(bmCount ?? 0);
      setBookNames(names);
      setActivity(labeled);
      setLoading(false);
    };

    load();
    const onUpdated = () => load();
    window.addEventListener("luz:reading-updated", onUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener("luz:reading-updated", onUpdated);
    };
  }, [userId, preferredVersion]);

  const saveSettings = async (patch: Partial<{ preferred_version_code: string; sounds_enabled: boolean; reminders_enabled: boolean; reminder_time: string }>) => {
    if (!userId) return;
    await supabase.from("user_settings").upsert({
      user_id: userId,
      preferred_version_code: patch.preferred_version_code ?? preferredVersion,
      sounds_enabled: patch.sounds_enabled ?? soundsEnabled,
      reminders_enabled: patch.reminders_enabled ?? remindersEnabled,
      reminder_time: patch.reminder_time ?? reminderTime,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 relative overflow-hidden text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <HorizontalNavbar />

      <main className="flex-1 relative z-10 px-4 md:px-8 py-10 pt-36">
        <div className="max-w-7xl mx-auto">
          {/* Header profile */}
          <div className="bg-slate-900/35 backdrop-blur-sm border border-slate-800/60 rounded-3xl p-8 mb-8 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 0%, rgba(245,158,11,0.08), transparent 60%), radial-gradient(circle at 70% 20%, rgba(59,130,246,0.10), transparent 60%)",
              }}
            />
            <div className="relative flex items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarFailed(true)}
                    className="w-16 h-16 rounded-2xl object-cover border border-amber-500/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-200 font-bold text-xl">
                    {(userName || userEmail || "U").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-2xl font-bold">{userName}</div>
                  <div className="text-slate-400">{userEmail}</div>
                  <div className="text-xs text-slate-500 mt-1">Miembro desde {memberSince}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
               
                <Link
                  href="/configuracion"
                  className="w-11 h-11 rounded-2xl bg-slate-950/40 border border-slate-700/50 text-slate-200 hover:bg-slate-800/50 transition-all flex items-center justify-center"
                  aria-label="Configuración"
                >
                  ⚙️
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Tus Estadísticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ReadingStreak />
              <div className="bg-slate-900/35 border border-slate-800/60 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-300">Capítulos Leídos</div>
                  <div className="w-10 h-10 rounded-xl bg-slate-950/40 border border-slate-700/50 flex items-center justify-center">📖</div>
                </div>
                <div className="text-4xl font-bold mt-3">{chaptersRead}</div>
                <div className="text-xs text-slate-400">de {totalChapters} totales</div>
              </div>
              <div className="bg-slate-900/35 border border-slate-800/60 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-300">Versículos Guardados</div>
                  <div className="w-10 h-10 rounded-xl bg-slate-950/40 border border-slate-700/50 flex items-center justify-center">🔖</div>
                </div>
                <div className="text-4xl font-bold mt-3">{bookmarksCount}</div>
                <div className="text-xs text-slate-400">en tu colección</div>
              </div>
              <div className="bg-slate-900/35 border border-slate-800/60 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-300">Días Activo</div>
                  <div className="w-10 h-10 rounded-xl bg-slate-950/40 border border-slate-700/50 flex items-center justify-center">🗓️</div>
                </div>
                <div className="text-4xl font-bold mt-3">{activeDays}</div>
                <div className="text-xs text-slate-400">lecturas registradas</div>
              </div>
              <div className="bg-slate-900/35 border border-slate-800/60 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-300">Logros</div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">🏆</div>
                </div>
                <div className="text-4xl font-bold mt-3">-</div>
                <div className="text-xs text-slate-400">Ver sección de logros</div>
              </div>
              <div className="bg-slate-900/35 border border-slate-800/60 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-300">Progreso Biblia</div>
                  <div className="w-10 h-10 rounded-xl bg-slate-950/40 border border-slate-700/50 flex items-center justify-center">📈</div>
                </div>
                <div className="text-4xl font-bold mt-3">{progressPercent}%</div>
                <div className="text-xs text-slate-400">completado</div>
              </div>
            </div>
          </div>

          {/* Top Row: Logros and Camino de Sabiduría */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Logros */}
            <section className="lg:col-span-2">
              <AchievementsSection />
            </section>

            {/* Camino de Sabiduría */}
            <aside className="bg-amber-950/20 border border-amber-500/20 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">📜</div>
                <div>
                  <div className="font-semibold">Camino de Sabiduría</div>
                  <div className="text-xs text-slate-400">Tu plan de lectura</div>
                </div>
              </div>
              <div className="text-sm text-slate-300 mb-3">Progreso del plan</div>
              <div className="h-2 bg-slate-800/60 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(100, progressPercent)}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                <span>{progressPercent}%</span>
                <span>{chaptersRead} de {totalChapters}</span>
              </div>
              <div className="bg-slate-950/30 border border-slate-800/60 rounded-2xl p-4 mb-4">
                <div className="text-xs text-amber-200 tracking-widest uppercase mb-1">Lectura de hoy</div>
                <div className="text-lg font-semibold">{nextReading.label}</div>
                <div className="text-xs text-slate-400">Siguiente recomendado</div>
              </div>
              <Link href={nextReading.href} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 transition-all">
                Continuar leyendo <span>›</span>
              </Link>
            </aside>
          </div>

          {/* Bottom Row: Sonidos, Recordatorio Suave, Configuración Rápida */}
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <AmbientSoundCard />
            <ReminderCard />
            <div className="bg-slate-900/35 border border-slate-800/60 rounded-3xl p-6">
              <div className="font-semibold text-xl mb-4">Configuración Rápida</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-950/40 border border-slate-700/50 flex items-center justify-center">🌐</div>
                    <div>
                      <div className="text-sm font-semibold">Versión Biblia</div>
                      <div className="text-xs text-slate-400">{preferredVersion.toUpperCase()}</div>
                    </div>
                  </div>
                  <select
                    value={preferredVersion}
                    onChange={async (e) => {
                      const v = e.target.value;
                      setPreferredVersion(v);
                      await saveSettings({ preferred_version_code: v });
                    }}
                    className="bg-slate-950/30 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="rv1960">RV1960</option>
                    <option value="rv1995">RV1995</option>
                    <option value="nvi">NVI</option>
                    <option value="dhh">DHH</option>
                    <option value="pdt">PDT</option>
                    <option value="kjv">KJV</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <section className="lg:col-span-2 bg-slate-900/35 border border-slate-800/60 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">Actividad Reciente</h3>
                  <p className="text-sm text-slate-400">Tu historial de lectura</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-slate-950/40 border border-slate-700/50 flex items-center justify-center">🕒</div>
              </div>

              {loading ? (
                <div className="text-slate-400">Cargando...</div>
              ) : activity.length === 0 ? (
                <div className="text-slate-400">Aún no hay actividad.</div>
              ) : (
                <div className="space-y-4">
                  {activity.map((a, idx) => {
                    const badgeClass =
                      a.color === "blue"
                        ? "bg-blue-500/15 text-blue-200 border-blue-500/20"
                        : a.color === "amber"
                          ? "bg-amber-500/15 text-amber-200 border-amber-500/20"
                          : "bg-purple-500/15 text-purple-200 border-purple-500/20";
                    const icon = a.type === "read" ? "📘" : a.type === "bookmark" ? "🔖" : "⭐";
                    const href =
                      a.type === "bookmark"
                        ? `/leer/${a.version_code}/${a.book_slug}/${a.chapter_number}?v=${a.verse_number}`
                        : `/leer/${a.version_code}/${a.book_slug}/${a.chapter_number}`;
                    return (
                      <Link key={idx} href={href} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/20 border border-slate-800/60 hover:bg-slate-950/30 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-950/40 border border-slate-700/50 flex items-center justify-center">{icon}</div>
                          <div>
                            <div className="font-semibold">{a.label}</div>
                            <div className="text-xs text-slate-400">{a.type === "read" ? "Capítulo completo" : a.type === "bookmark" ? "Versículo guardado" : "Capítulo favorito"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>{a.badge}</span>
                          <span className="text-xs text-slate-500">{timeAgoEs(a.at)}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            <aside className="bg-slate-900/35 border border-slate-800/60 rounded-3xl p-6">
              <div className="font-semibold text-xl mb-3">Accesos</div>
              <div className="space-y-3">
                <Link href="/marcadores" className="block px-4 py-3 rounded-2xl bg-slate-950/20 border border-slate-800/60 hover:bg-slate-950/30 transition-all">
                  Mis Marcadores →
                </Link>
                <Link href="/favoritos" className="block px-4 py-3 rounded-2xl bg-slate-950/20 border border-slate-800/60 hover:bg-slate-950/30 transition-all">
                  Mis Favoritos →
                </Link>
                <Link href="/busqueda" className="block px-4 py-3 rounded-2xl bg-slate-950/20 border border-slate-800/60 hover:bg-slate-950/30 transition-all">
                  Buscar versículos →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

