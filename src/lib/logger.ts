import { supabase } from './supabase';

type LogSeverity = 'info' | 'warning' | 'error' | 'critical';

interface LogPayload {
  message: string;
  details?: Record<string, unknown> | unknown;
  path?: string;
  metadata?: Record<string, unknown>;
  user_id?: string;
}

class Logger {
  private async log(severity: LogSeverity, payload: LogPayload) {
    const { message, details, path, metadata, user_id } = payload;

    // always log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${severity.toUpperCase()}] ${message}`, details);
    }

    try {
      // Get current user if not provided
      let userId = user_id;
      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        userId = session?.user?.id;
      }

      const { error } = await supabase.from('system_logs').insert({
        severity,
        message,
        details: details ? JSON.stringify(details) : null,
        path: path || typeof window !== 'undefined' ? window.location.pathname : undefined,
        metadata: {
            ...metadata,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        },
        user_id: userId,
      });

      if (error) {
        console.error('Failed to write to system_logs:', error);
      }
    } catch (err) {
      console.error('Logger exception:', err);
    }
  }

  info(message: string, details?: unknown) {
    this.log('info', { message, details: details as Record<string, unknown> });
  }

  warning(message: string, details?: unknown) {
    this.log('warning', { message, details: details as Record<string, unknown> });
  }

  error(message: string, details?: unknown, path?: string) {
    this.log('error', { message, details: details as Record<string, unknown>, path });
  }

  critical(message: string, details?: unknown) {
    this.log('critical', { message, details: details as Record<string, unknown> });
  }
}

export const logger = new Logger();
