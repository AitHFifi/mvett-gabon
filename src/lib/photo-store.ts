import { supabase, isSupabaseConfigured } from './supabase';

export type PhotoStatus = 'pending' | 'approved' | 'rejected';

export interface CommunityPhoto {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  province_id: string;
  title: string;
  location: string;
  caption?: string;
  image_url: string;
  background_color: string;
  status: PhotoStatus;
  approved_at?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  name: string;
  avatar?: string;
  isDemo?: boolean;
}

const DEMO_USER_KEY = 'mvett_demo_user';
const LOCAL_PHOTOS_KEY = 'mvett_community_photos';

// Palette de fonds naturels gabonais par défaut
const DEFAULT_BG_COLORS = ['#1b2c34', '#13241b', '#27383a', '#2d241c', '#1b2d2a', '#1e2430'];

export class PhotoStore {
  private static instance: PhotoStore;

  private constructor() {
    // Si nous sommes dans le navigateur, synchroniser les événements
    if (typeof window !== 'undefined' && isSupabaseConfigured() && supabase) {
      supabase.auth.onAuthStateChange((event, session) => {
        const user = session?.user
          ? {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Contributeur',
              avatar: session.user.user_metadata?.avatar_url || '',
              isDemo: false,
            }
          : null;
        window.dispatchEvent(new CustomEvent('mvett:auth-changed', { detail: user }));
      });
    }
  }

  public static getInstance(): PhotoStore {
    if (!PhotoStore.instance) {
      PhotoStore.instance = new PhotoStore();
    }
    return PhotoStore.instance;
  }

  // ==========================================
  // AUTHENTIFICATION
  // ==========================================

  public async getCurrentUser(): Promise<UserProfile | null> {
    if (typeof window === 'undefined') return null;

    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const u = data.session.user;
        return {
          id: u.id,
          email: u.email,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Contributeur',
          avatar: u.user_metadata?.avatar_url || '',
          isDemo: false,
        };
      }
    }

    // Vérifier l'utilisateur démo stocké localement
    const rawDemo = localStorage.getItem(DEMO_USER_KEY);
    if (rawDemo) {
      try {
        return JSON.parse(rawDemo) as UserProfile;
      } catch {
        localStorage.removeItem(DEMO_USER_KEY);
      }
    }

    return null;
  }

  public async loginWithGoogle(): Promise<{ error?: string }> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) return { error: error.message };
      return {};
    }

    // Fallback mode démo
    return this.loginAsGuest('Explorateur MVETT');
  }

  public async loginWithMagicLink(email: string): Promise<{ success?: boolean; message?: string; error?: string }> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) return { error: error.message };
      return { success: true, message: 'Un lien de connexion magique a été envoyé à votre adresse e-mail.' };
    }

    // Fallback mode démo
    const name = email.split('@')[0] || 'Contributeur';
    await this.loginAsGuest(name, email);
    return { success: true, message: `Connecté en mode Démo pour ${email}` };
  }

  public async loginAsGuest(name: string = 'Contributeur Gabon', email?: string): Promise<{ error?: string }> {
    const guestUser: UserProfile = {
      id: 'demo-user-' + Math.random().toString(36).substring(2, 9),
      name: name || 'Contributeur Gabon',
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@mvett.ga`,
      avatar: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(name)}`,
      isDemo: true,
    };

    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(guestUser));
    window.dispatchEvent(new CustomEvent('mvett:auth-changed', { detail: guestUser }));
    return {};
  }

  public async logout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(DEMO_USER_KEY);
    window.dispatchEvent(new CustomEvent('mvett:auth-changed', { detail: null }));
  }

  public isAdmin(user?: UserProfile | null): boolean {
    if (!user) return false;
    const adminEmails = ['alloghofrederic9@gmail.com', 'admin@mvett.ga'];
    return !!(user.email && adminEmails.includes(user.email.toLowerCase()));
  }

  // ==========================================
  // GESTION DES PHOTOS
  // ==========================================

  public async getPhotos(
    options?: { provinceId?: string; status?: 'all' | PhotoStatus } | string
  ): Promise<CommunityPhoto[]> {
    if (typeof window === 'undefined') return [];

    let provinceId: string | undefined = undefined;
    let targetStatus: 'all' | PhotoStatus = 'approved';

    if (typeof options === 'string') {
      provinceId = options;
    } else if (options) {
      provinceId = options.provinceId;
      targetStatus = options.status ?? 'approved';
    }

    let photos: CommunityPhoto[] = [];

    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('community_photos').select('*').order('created_at', { ascending: false });
      if (provinceId) {
        query = query.eq('province_id', provinceId);
      }
      if (targetStatus !== 'all') {
        query = query.eq('status', targetStatus);
      }
      const { data, error } = await query;
      if (!error && data) {
        photos = (data as any[]).map((p) => ({
          ...p,
          status: p.status || 'approved',
        })) as CommunityPhoto[];
      }
    }

    // Combiner avec les photos locales (mode démo ou hors-ligne)
    const localPhotos = this.getLocalPhotos();
    const combined = [...photos, ...localPhotos];

    // Filtrer par province si demandé
    let filtered = provinceId ? combined.filter((p) => p.province_id === provinceId) : combined;

    // Filtrer par statut si demandé
    if (targetStatus !== 'all') {
      filtered = filtered.filter((p) => (p.status || 'approved') === targetStatus);
    }

    // Dédupliquer par id
    const uniqueMap = new Map<string, CommunityPhoto>();
    filtered.forEach((p) => uniqueMap.set(p.id, p));

    return Array.from(uniqueMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public async uploadPhoto(params: {
    file: File;
    provinceId: string;
    title: string;
    location: string;
    caption?: string;
    backgroundColor?: string;
  }): Promise<{ photo?: CommunityPhoto; error?: string }> {
    const user = await this.getCurrentUser();
    if (!user) {
      return { error: 'Vous devez être connecté pour téléverser une photo.' };
    }

    const initialStatus: PhotoStatus = this.isAdmin(user) ? 'approved' : 'pending';

    // Choisir une couleur de fond élégante
    const bgColor =
      params.backgroundColor ||
      DEFAULT_BG_COLORS[Math.floor(Math.random() * DEFAULT_BG_COLORS.length)];

    // Si Supabase est configuré et non-démo
    if (isSupabaseConfigured() && supabase && !user.isDemo) {
      try {
        const fileExt = params.file.name.split('.').pop() || 'jpg';
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('province-photos')
          .upload(fileName, params.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.warn('Erreur Supabase Storage, repli vers DataURL:', uploadError.message);
          // Continuer avec la méthode locale si le bucket n'est pas encore prêt
        } else {
          const { data: urlData } = supabase.storage.from('province-photos').getPublicUrl(uploadData.path);
          const publicUrl = urlData.publicUrl;

          const newPhotoRow = {
            user_id: user.id,
            user_name: user.name,
            user_avatar: user.avatar,
            province_id: params.provinceId,
            title: params.title.trim(),
            location: params.location.trim(),
            caption: params.caption?.trim() || '',
            image_url: publicUrl,
            background_color: bgColor,
            status: initialStatus,
          };

          const { data: insertData, error: insertError } = await supabase
            .from('community_photos')
            .insert([newPhotoRow])
            .select()
            .single();

          if (insertError) {
            return { error: insertError.message };
          }

          const createdPhoto = insertData as CommunityPhoto;
          window.dispatchEvent(new CustomEvent('mvett:photos-updated', { detail: createdPhoto }));
          return { photo: createdPhoto };
        }
      } catch (err: unknown) {
        console.error('Erreur Supabase:', err);
      }
    }

    // Mode Local / Démo Fallback (ou conversion DataURL)
    const dataUrl = await this.fileToDataUrl(params.file);
    const localPhoto: CommunityPhoto = {
      id: 'local-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      user_id: user.id,
      user_name: user.name,
      user_avatar: user.avatar,
      province_id: params.provinceId,
      title: params.title.trim(),
      location: params.location.trim(),
      caption: params.caption?.trim() || '',
      image_url: dataUrl,
      background_color: bgColor,
      status: initialStatus,
      created_at: new Date().toISOString(),
    };

    this.saveLocalPhoto(localPhoto);
    window.dispatchEvent(new CustomEvent('mvett:photos-updated', { detail: localPhoto }));
    return { photo: localPhoto };
  }

  public async approvePhoto(photoId: string): Promise<{ success: boolean; error?: string }> {
    const user = await this.getCurrentUser();
    if (!user) return { success: false, error: 'Non authentifié' };

    if (isSupabaseConfigured() && supabase && !user.isDemo) {
      const { error } = await supabase
        .from('community_photos')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', photoId);

      if (error) return { success: false, error: error.message };
    }

    // Mettre à jour localement
    const locals = this.getLocalPhotos();
    const target = locals.find((p) => p.id === photoId);
    if (target) {
      target.status = 'approved';
      target.approved_at = new Date().toISOString();
      localStorage.setItem(LOCAL_PHOTOS_KEY, JSON.stringify(locals));
    }

    window.dispatchEvent(new CustomEvent('mvett:photos-updated', { detail: { id: photoId, status: 'approved' } }));
    return { success: true };
  }

  public async rejectPhoto(photoId: string): Promise<{ success: boolean; error?: string }> {
    const user = await this.getCurrentUser();
    if (!user) return { success: false, error: 'Non authentifié' };

    if (isSupabaseConfigured() && supabase && !user.isDemo) {
      const { error } = await supabase
        .from('community_photos')
        .update({ status: 'rejected' })
        .eq('id', photoId);

      if (error) return { success: false, error: error.message };
    }

    // Mettre à jour localement
    const locals = this.getLocalPhotos();
    const target = locals.find((p) => p.id === photoId);
    if (target) {
      target.status = 'rejected';
      localStorage.setItem(LOCAL_PHOTOS_KEY, JSON.stringify(locals));
    }

    window.dispatchEvent(new CustomEvent('mvett:photos-updated', { detail: { id: photoId, status: 'rejected' } }));
    return { success: true };
  }

  public async deletePhoto(photoId: string): Promise<{ success: boolean; error?: string }> {
    const user = await this.getCurrentUser();
    if (!user) return { success: false, error: 'Non authentifié' };

    // Si Supabase
    if (isSupabaseConfigured() && supabase && !user.isDemo) {
      const { error } = await supabase
        .from('community_photos')
        .delete()
        .eq('id', photoId);

      if (error) return { success: false, error: error.message };
    }

    // Supprimer aussi du stockage local
    this.removeLocalPhoto(photoId);
    window.dispatchEvent(new CustomEvent('mvett:photos-updated', { detail: { deletedId: photoId } }));
    return { success: true };
  }

  // Méthodes utilitaires locales
  private getLocalPhotos(): CommunityPhoto[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(LOCAL_PHOTOS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveLocalPhoto(photo: CommunityPhoto): void {
    const photos = this.getLocalPhotos();
    photos.unshift(photo);
    // Garder un nombre raisonnable en local pour éviter de saturer le localStorage
    const trimmed = photos.slice(0, 30);
    try {
      localStorage.setItem(LOCAL_PHOTOS_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('LocalStorage saturé, les images locales lourdes ne sont conservées qu’en mémoire session.');
    }
  }

  private removeLocalPhoto(photoId: string): void {
    const photos = this.getLocalPhotos().filter((p) => p.id !== photoId);
    localStorage.setItem(LOCAL_PHOTOS_KEY, JSON.stringify(photos));
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const photoStore = PhotoStore.getInstance();
