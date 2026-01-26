import { supabase } from '../supabase';

export interface UserSettings {
  preferred_version_code?: string;
  sounds_enabled?: boolean;
  reminders_enabled?: boolean;
  reminder_time?: string;
}

/**
 * Servicio para operaciones relacionadas con la configuración del usuario
 */
export class UserSettingsService {
  /**
   * Obtiene la configuración del usuario
   */
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('preferred_version_code, sounds_enabled, reminders_enabled, reminder_time')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }

    return data;
  }

  /**
   * Guarda o actualiza la configuración del usuario
   */
  static async saveUserSettings(
    userId: string,
    settings: Partial<UserSettings>
  ): Promise<void> {
    const { error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: userId,
          ...settings,
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('Error saving user settings:', error);
      throw error;
    }
  }

  /**
   * Actualiza una parte específica de la configuración
   */
  static async updateUserSettings(
    userId: string,
    patch: Partial<UserSettings>
  ): Promise<void> {
    await this.saveUserSettings(userId, patch);
  }
}
