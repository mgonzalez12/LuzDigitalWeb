'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';

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

// Icon component for achievements
const AchievementIcon = ({ id, unlocked, color }: { id: string; unlocked: boolean; color: string }) => {
  const iconClass = `w-5 h-5 ${unlocked ? "text-white" : "text-slate-400"}`;
  const bgColorClass = unlocked
    ? color === "slate"
      ? "bg-slate-500"
      : color === "blue"
        ? "bg-blue-500"
        : color === "purple"
          ? "bg-purple-500"
          : color === "amber"
            ? "bg-amber-500"
            : "bg-green-500"
    : "bg-slate-700";

  switch (id) {
    case "first":
      return (
        <div className={`w-10 h-10 rounded-xl ${bgColorClass} flex items-center justify-center`}>
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      );
    case "week":
      return (
        <div className={`w-10 h-10 rounded-xl ${bgColorClass} flex items-center justify-center`}>
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        </div>
      );
    case "month":
      return (
        <div className={`w-10 h-10 rounded-xl ${bgColorClass} flex items-center justify-center`}>
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      );
    case "collector":
      return (
        <div className={`w-10 h-10 rounded-xl ${bgColorClass} flex items-center justify-center`}>
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      );
    case "disciplined":
      return (
        <div className={`w-10 h-10 rounded-xl ${bgColorClass} flex items-center justify-center`}>
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case "psalmist":
      return (
        <div className={`w-10 h-10 rounded-xl ${bgColorClass} flex items-center justify-center`}>
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
      );
    case "newtestament":
      return (
        <div className={`w-10 h-10 rounded-xl ${bgColorClass} flex items-center justify-center`}>
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      );
    case "year":
      return (
        <div className={`w-10 h-10 rounded-xl ${bgColorClass} flex items-center justify-center`}>
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className={`w-10 h-10 rounded-xl ${bgColorClass} flex items-center justify-center`}>
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      );
  }
};

// Skeleton component
function AchievementsSkeleton() {
  return (
    <section className="lg:col-span-2 bg-slate-900/35 border border-slate-800/60 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-7 w-24 bg-slate-800/60 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-40 bg-slate-800/60 rounded animate-pulse"></div>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-slate-800/60 animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-800/60 bg-slate-950/20 p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/60 animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 bg-slate-800/60 rounded animate-pulse"></div>
              <div className="h-4 w-48 bg-slate-800/60 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AchievementsSection() {
  const { user } = useAppSelector((s) => s.auth);
  const userId = user?.id;

  const [loading, setLoading] = useState(true);
  const [preferredVersion, setPreferredVersion] = useState<string>("rv1960");
  const [streak, setStreak] = useState(0);
  const [chaptersRead, setChaptersRead] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [activeDays, setActiveDays] = useState(0);
  const [psalmsCompleted, setPsalmsCompleted] = useState(false);
  const [newTestamentCompleted, setNewTestamentCompleted] = useState(false);

  // Load user settings for preferred version
  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      if (!userId) return;
      const { data } = await supabase
        .from("user_settings")
        .select("preferred_version_code")
        .eq("user_id", userId)
        .maybeSingle();

      if (cancelled) return;
      if (data) {
        setPreferredVersion((data as any).preferred_version_code || "rv1960");
      }
    };

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Load achievements data
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!userId) return;
      setLoading(true);

      try {
        // Racha / días activos
        const { data: daysRows } = await supabase
          .from("user_reading_days")
          .select("day")
          .eq("user_id", userId)
          .order("day", { ascending: false })
          .limit(400); // Necesitamos más días para calcular 365

        const days = (daysRows ?? []) as Array<{ day: string }>;
        const streakValue = computeStreakUtc(days.map((d) => d.day));
        const activeDaysCount = days.length;

        // Capítulos leídos (versión preferida)
        const { count: readCount } = await supabase
          .from("user_chapter_progress")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("version_code", preferredVersion);

        // Versículos guardados
        const { count: bmCount } = await supabase
          .from("user_verse_bookmarks")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        // Verificar si completó Salmos
        // Obtener total de capítulos de Salmos
        const { data: psalmsBook } = await supabase
          .from("bible_books")
          .select("chapter_count")
          .eq("version_code", preferredVersion)
          .eq("slug", "salmos")
          .maybeSingle();

        const psalmsTotalChapters = psalmsBook?.chapter_count || 150;

        // Contar capítulos leídos de Salmos
        const { count: psalmsReadCount } = await supabase
          .from("user_chapter_progress")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("version_code", preferredVersion)
          .eq("book_slug", "salmos");

        const psalmsCompletedValue = (psalmsReadCount ?? 0) >= psalmsTotalChapters;

        // Verificar si completó Nuevo Testamento
        // Obtener libros del Nuevo Testamento
        const { data: newTestamentBooks } = await supabase
          .from("bible_books")
          .select("slug, chapter_count")
          .eq("version_code", preferredVersion)
          .eq("testament", "new");

        const newTestamentTotalChapters = newTestamentBooks?.reduce((sum, book) => sum + (book.chapter_count || 0), 0) || 0;

        // Contar capítulos leídos del Nuevo Testamento
        const newTestamentBookSlugs = newTestamentBooks?.map(b => b.slug) || [];
        
        let newTestamentReadCount = 0;
        if (newTestamentBookSlugs.length > 0) {
          const { count } = await supabase
            .from("user_chapter_progress")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("version_code", preferredVersion)
            .in("book_slug", newTestamentBookSlugs);
          
          newTestamentReadCount = count || 0;
        }

        const newTestamentCompletedValue = newTestamentReadCount >= newTestamentTotalChapters;

        if (cancelled) return;

        setStreak(streakValue);
        setActiveDays(activeDaysCount);
        setChaptersRead(readCount ?? 0);
        setBookmarksCount(bmCount ?? 0);
        setPsalmsCompleted(psalmsCompletedValue);
        setNewTestamentCompleted(newTestamentCompletedValue);
      } catch (error) {
        console.error("Error loading achievements:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (preferredVersion) {
      load();
    }

    const onUpdated = () => {
      if (preferredVersion) {
        load();
      }
    };
    window.addEventListener("luz:reading-updated", onUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener("luz:reading-updated", onUpdated);
    };
  }, [userId, preferredVersion]);

  const achievements = useMemo(() => {
    const defs = [
      { id: "first", title: "Primera Lectura", desc: "Completa tu primer capítulo", unlocked: chaptersRead >= 1, color: "slate" },
      { id: "week", title: "Semana de Fuego", desc: "7 días consecutivos leyendo", unlocked: streak >= 7, color: "blue" },
      { id: "month", title: "Mes Imparable", desc: "30 días consecutivos leyendo", unlocked: streak >= 30, color: "purple" },
      { id: "collector", title: "Coleccionista", desc: "Guarda 100 versículos", unlocked: bookmarksCount >= 100, color: "amber" },
      { id: "disciplined", title: "Disciplinado", desc: "Cumple tu meta diaria 50 veces", unlocked: activeDays >= 50, color: "blue" },
      { id: "psalmist", title: "Salmista", desc: "Completa el libro de Salmos", unlocked: psalmsCompleted, color: "green" },
      { id: "newtestament", title: "Nuevo Testamento", desc: "Completa el Nuevo Testamento", unlocked: newTestamentCompleted, color: "purple" },
      { id: "year", title: "Fiel Todo el Año", desc: "365 días consecutivos leyendo", unlocked: streak >= 365, color: "amber" },
    ] as const;
    const unlocked = defs.filter((d) => d.unlocked).length;
    return { defs, unlocked, total: defs.length };
  }, [chaptersRead, streak, bookmarksCount, activeDays, psalmsCompleted, newTestamentCompleted]);

  if (loading) {
    return <AchievementsSkeleton />;
  }

  return (
    <section className="lg:col-span-2 bg-slate-900/35 border border-slate-800/60 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">Logros</h3>
          <p className="text-sm text-slate-400">{achievements.unlocked} de {achievements.total} desbloqueados</p>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">👑</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.defs.map((a) => {
          const getBorderBgClasses = () => {
            if (!a.unlocked) {
              return "border-slate-800/60 bg-slate-950/20 opacity-60";
            }
            switch (a.color) {
              case "slate":
                return "border-slate-500/30 bg-slate-500/10";
              case "blue":
                return "border-blue-500/30 bg-blue-500/10";
              case "purple":
                return "border-purple-500/30 bg-purple-500/10";
              case "amber":
                return "border-amber-500/30 bg-amber-500/10";
              case "green":
                return "border-green-500/30 bg-green-500/10";
              default:
                return "border-slate-800/60 bg-slate-950/20";
            }
          };
          return (
            <div key={a.id} className={`rounded-2xl border p-4 flex items-start gap-3 ${getBorderBgClasses()}`}>
              <AchievementIcon id={a.id} unlocked={a.unlocked} color={a.color} />
              <div className="flex-1">
                <div className="font-semibold">{a.title}</div>
                <div className="text-xs text-slate-400 mt-1">{a.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
