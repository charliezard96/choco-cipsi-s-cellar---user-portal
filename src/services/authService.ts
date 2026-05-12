import { supabase } from '../lib/supabase';

export const authService = {
  async getAppSettings(key: string) {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error(`[authService] Errore fetch setting "${key}":`, error);
      return null;
    }
    return data?.value as boolean | null;
  },

  async isGoogleLoginEnabled() {
    const value = await this.getAppSettings('google_login_enabled');
    return value === true;
  },

  async isTastingsEnabled() {
    const value = await this.getAppSettings('tastings_enabled');
    return value !== false; // default true se assente
  },

  async initiateGoogleLogin(redirectTo: string) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) throw error;
    return data;
  },
};