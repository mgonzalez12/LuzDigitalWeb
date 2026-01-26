import { createMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import HomePageClient from '@/app/HomePageClient';

export const metadata: Metadata = createMetadata({
  title: 'Luz Digital - La Palabra de Dios en Nueva Luz',
  description: 'Una experiencia digital moderna para el creyente de hoy. Sumérgete en la Palabra y el amor de Dios con un diseño inspirador.',
  keywords: [
    'Biblia online',
    'lectura bíblica digital',
    'aplicación bíblica',
    'versículos del día',
    'estudio bíblico',
    'fe cristiana',
    'espiritualidad digital',
  ],
  url: '/',
});

export default function Home() {
  return <HomePageClient />;
}
