import { supabase } from '../supabase';

export interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type?: string;
}

/**
 * Servicio para operaciones relacionadas con notificaciones del usuario
 */
export class UserNotificationsService {
  /**
   * Crea o actualiza una notificación
   */
  static async upsertNotification(
    userId: string,
    notification: {
      title: string;
      message: string;
      is_read?: boolean;
    }
  ): Promise<UserNotification | null> {
    const { data, error } = await supabase
      .from('user_notifications')
      .upsert({
        user_id: userId,
        title: notification.title,
        message: notification.message,
        is_read: notification.is_read ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting notification:', error);
      return null;
    }

    return data;
  }

  /**
   * Marca una notificación como leída
   */
  static async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Elimina una notificación
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('user_notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las notificaciones del usuario
   */
  static async getUserNotifications(
    userId: string,
    options?: {
      unreadOnly?: boolean;
      limit?: number;
    }
  ): Promise<UserNotification[]> {
    let query = supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.unreadOnly) {
      query = query.eq('is_read', false);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }

    return data ?? [];
  }
}
