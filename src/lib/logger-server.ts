import { createClient } from "@/lib/supabase-server";

export type LogAction = 
  | 'login' 
  | 'create_product' 
  | 'update_product' 
  | 'delete_product'
  | 'create_ticket'
  | 'update_ticket'
  | 'delete_ticket';

export type EntityType = 'user' | 'product' | 'ticket' | 'system';

interface LogActivityParams {
  action: LogAction;
  entityType: EntityType;
  entityId?: string;
  details?: Record<string, any>;
}

export async function logActivity({ action, entityType, entityId, details }: LogActivityParams) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn("Attempted to log activity without authenticated user:", action);
      return;
    }

    const { error } = await supabase.from('activity_logs').insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      ip_address: '0.0.0.0' // Placeholder
    });

    if (error) {
      console.error("Failed to log activity:", error);
    }
  } catch (err) {
    console.error("Error in logActivity:", err);
  }
}
