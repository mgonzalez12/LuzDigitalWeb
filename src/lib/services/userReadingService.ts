import { supabase } from '../supabase';

export interface ReadingDay {
  user_id: string;
  day: string;
}

/**
 * Servicio para operaciones relacionadas con la racha de lectura del usuario
 */
export class UserReadingService {
  /**
   * Obtiene los días de lectura del usuario
   */
  static async getReadingDays(userId: string): Promise<ReadingDay[]> {
    const { data, error } = await supabase
      .from('user_reading_days')
      .select('day')
      .eq('user_id', userId)
      .order('day', { ascending: false });

    if (error) {
      console.error('Error fetching reading days:', error);
      return [];
    }

    return data ?? [];
  }

  /**
   * Registra un día de lectura
   */
  static async addReadingDay(userId: string, day?: string): Promise<void> {
    const dayToInsert = day || new Date().toISOString().slice(0, 10);

    const { error } = await supabase.from('user_reading_days').insert({
      user_id: userId,
      day: dayToInsert,
    });

    if (error) {
      // Si el error es por duplicado (PK constraint), lo ignoramos silenciosamente
      if (error.code === '23505') {
        return;
      }
      console.error('Error adding reading day:', error);
      throw error;
    }
  }

  /**
   * Elimina todos los días de lectura del usuario
   * (útil para resetear la racha)
   */
  static async clearReadingDays(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_reading_days')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing reading days:', error);
      throw error;
    }
  }
}
