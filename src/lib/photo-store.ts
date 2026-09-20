import { supabase, isSupabaseConfigured } from './supabase';
import { provinces } from '../data/provinces';

export type PhotoStatus = 'pending' | 'approved' | 'rejected' | 'archived';

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
  is_official?: boolean;
  display_order?: number;
  status: PhotoStatus;
  approved_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  name: string;
  avatar?: string;
  role?: 'admin' | 'moderator' | 'user';
  isDemo?: boolean;
}

const DEMO_USER_KEY = 'mvett_demo_user';
const LOCAL_PHOTOS_KEY = 'mvett_community_photos';
const DELETED_PHOTOS_KEY = 'mvett_deleted_photo_ids';
const SEED_VERSION_KEY = 'mvett_catalog_seeded_v3';

// Palette de fonds naturels gabonais par défaut
export const DEFAULT_BG_COLORS = ['#1b2c34', '#13241b', '#27383a', '#522b1c', '#183138', '#202a33', '#1c2e26', '#1f2e3d', '#52191c'];

export class PhotoStore {
  private static instance: PhotoStore;

  private constructor() {
    // Si nous sommes dans le navigateur, synchroniser les événements
    if (typeof window !== 'undefined' && isSupabaseConfigured() && supabase) {
      supabase.auth.onAuthStateChange(async (event, session) => {
        let role: 'admin' | 'moderator' | 'user' | undefined = (session?.user?.app_metadata?.role as any) || undefined;
        if (session?.user && !role && supabase) {
          try {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .maybeSingle();
            if (roleData?.role) {
              role = roleData.role;
            }
          } catch {
            // Ignorer si table non présente
          }
        }

        const user: UserProfile | null = session?.user
          ? {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Contributeur',
              avatar: session.user.user_metadata?.avatar_url || '',
              role,
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
        let role: 'admin' | 'moderator' | 'user' | undefined = (u.app_metadata?.role as any) || undefined;
        if (!role) {
          try {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', u.id)
              .maybeSingle();
            if (roleData?.role) {
              role = roleData.role;
            }
          } catch {
            // Ignorer si table non présente
          }
        }
        return {
          id: u.id,
          email: u.email,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Contributeur',
          avatar: u.user_metadata?.avatar_url || '',
          role,
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
    if (!user || user.isDemo) return false;
    if (user.role === 'admin') return true;
    const adminEmail = 'alloghofrederic9@gmail.com';
    return !!(user.email && user.email.toLowerCase() === adminEmail);
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
        const fileExt = params.file.name.split('.').pop() || 'webp';
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('province-photos')
          .upload(fileName, params.file, {
            contentType: params.file.type || 'image/webp',
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

  public async deletePhoto(photoId: string, permanent: boolean = true): Promise<{ success: boolean; error?: string }> {
    const user = await this.getCurrentUser();
    if (!user) return { success: false, error: 'Non authentifié' };

    if (!permanent) {
      return this.archiveCatalogPhoto(photoId);
    }

    // Supprimer définitivement
    this.markPhotoDeleted(photoId);

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
    this.dispatchCatalogEvents({ deletedId: photoId });
    return { success: true };
  }

  // ==========================================
  // CATALOGUE OFFICIEL & MANIPULATION ADMIN
  // ==========================================

  public ensureCatalogSeeded(): void {
    if (typeof window === 'undefined') return;
    const isSeeded = localStorage.getItem(SEED_VERSION_KEY);
    if (isSeeded) return;

    const currentLocal = this.getLocalPhotos();
    const existingIds = new Set(currentLocal.map((p) => p.id));
    const deletedIds = this.getDeletedPhotoIds();
    const seeded: CommunityPhoto[] = [];

    provinces.forEach((prov) => {
      prov.photos.forEach((ph, idx) => {
        if (!existingIds.has(ph.id) && !deletedIds.has(ph.id)) {
          seeded.push({
            id: ph.id,
            user_id: 'mvett-heritage-curator',
            user_name: 'Patrimoine MVETT',
            province_id: prov.id,
            title: ph.title,
            location: ph.location,
            caption: ph.caption || '',
            image_url: ph.image,
            background_color: ph.backgroundColor || '#1b2c34',
            is_official: true,
            display_order: idx,
            status: 'approved',
            created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
          });
        }
      });
    });

    if (seeded.length > 0) {
      const merged = [...currentLocal, ...seeded];
      try {
        localStorage.setItem(LOCAL_PHOTOS_KEY, JSON.stringify(merged));
      } catch (e) {
        console.warn('LocalStorage saturé lors du seeding initial', e);
      }
    }
    localStorage.setItem(SEED_VERSION_KEY, 'true');
  }

  public async getCatalogPhotos(options?: {
    provinceId?: string;
    includeArchived?: boolean;
  }): Promise<CommunityPhoto[]> {
    if (typeof window === 'undefined') return [];
    this.ensureCatalogSeeded();

    const deletedIds = this.getDeletedPhotoIds();
    let dbPhotos: CommunityPhoto[] = [];

    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('community_photos').select('*');
      if (options?.provinceId && options.provinceId !== 'all') {
        query = query.eq('province_id', options.provinceId);
      }
      if (!options?.includeArchived) {
        query = query.eq('status', 'approved');
      } else {
        query = query.in('status', ['approved', 'archived']);
      }
      query = query.order('display_order', { ascending: true }).order('created_at', { ascending: true });

      const { data, error } = await query;
      if (!error && data) {
        dbPhotos = data as CommunityPhoto[];
      }
    }

    const localPhotos = this.getLocalPhotos();
    const combined = [...dbPhotos, ...localPhotos];

    // Dédupliquer par id
    const uniqueMap = new Map<string, CommunityPhoto>();
    combined.forEach((p) => {
      if (!deletedIds.has(p.id)) {
        uniqueMap.set(p.id, p);
      }
    });

    let list = Array.from(uniqueMap.values());

    // Filtrer par province si demandé
    if (options?.provinceId && options.provinceId !== 'all') {
      list = list.filter((p) => p.province_id === options.provinceId);
    }

    // Filtrer par statut
    if (!options?.includeArchived) {
      list = list.filter((p) => p.status === 'approved');
    } else {
      list = list.filter((p) => p.status === 'approved' || p.status === 'archived');
    }

    // Map des index de province pour trier d'abord par l'ordre officiel des provinces (G1 à G9)
    const provIndexMap = new Map<string, number>();
    provinces.forEach((p, idx) => provIndexMap.set(p.id, idx));

    return list.sort((a, b) => {
      const pA = provIndexMap.get(a.province_id) ?? 99;
      const pB = provIndexMap.get(b.province_id) ?? 99;
      if (pA !== pB) return pA - pB;
      const orderA = a.display_order ?? 0;
      const orderB = b.display_order ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }

  public async createCatalogPhoto(params: {
    file?: File;
    imageUrl?: string;
    provinceId: string;
    title: string;
    location: string;
    caption?: string;
    backgroundColor?: string;
  }): Promise<{ photo?: CommunityPhoto; error?: string }> {
    const user = await this.getCurrentUser();
    if (!user) {
      return { error: 'Vous devez être connecté en tant qu’administrateur.' };
    }

    if (!params.file && !params.imageUrl?.trim()) {
      return { error: 'Veuillez fournir un fichier image ou un lien d’image direct.' };
    }

    // Calculer le display_order suivant pour cette province
    const existing = await this.getCatalogPhotos({ provinceId: params.provinceId, includeArchived: true });
    const maxOrder = existing.reduce((max, p) => Math.max(max, p.display_order ?? 0), -1);
    const nextOrder = maxOrder + 1;

    const bgColor = params.backgroundColor?.trim() || DEFAULT_BG_COLORS[0];
    let imageUrl = params.imageUrl?.trim() || '';

    if (params.file) {
      if (isSupabaseConfigured() && supabase && !user.isDemo) {
        try {
          const fileExt = params.file.name.split('.').pop() || 'webp';
          const fileName = `official/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('province-photos')
            .upload(fileName, params.file, {
              contentType: params.file.type || 'image/webp',
              cacheControl: '3600',
              upsert: false,
            });
          if (!uploadError && uploadData) {
            const { data: urlData } = supabase.storage.from('province-photos').getPublicUrl(uploadData.path);
            imageUrl = urlData.publicUrl;
          }
        } catch (e) {
          console.warn('Erreur Supabase Storage upload, repli vers DataURL', e);
        }
      }
      if (!imageUrl) {
        imageUrl = await this.fileToDataUrl(params.file);
      }
    }

    const photoId = 'photo-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const newPhoto: CommunityPhoto = {
      id: photoId,
      user_id: user.id,
      user_name: user.name || 'Conservateur MVETT',
      user_avatar: user.avatar,
      province_id: params.provinceId,
      title: params.title.trim(),
      location: params.location.trim(),
      caption: params.caption?.trim() || '',
      image_url: imageUrl,
      background_color: bgColor,
      is_official: true,
      display_order: nextOrder,
      status: 'approved',
      approved_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase && !user.isDemo) {
      try {
        const { data, error } = await supabase
          .from('community_photos')
          .insert([newPhoto])
          .select()
          .single();
        if (!error && data) {
          const created = data as CommunityPhoto;
          this.saveLocalPhoto(created);
          this.dispatchCatalogEvents(created);
          return { photo: created };
        }
      } catch (err: unknown) {
        console.error('Erreur Supabase insert', err);
      }
    }

    this.saveLocalPhoto(newPhoto);
    this.dispatchCatalogEvents(newPhoto);
    return { photo: newPhoto };
  }

  public async updateCatalogPhoto(
    id: string,
    updates: {
      title?: string;
      location?: string;
      caption?: string;
      provinceId?: string;
      backgroundColor?: string;
      file?: File;
      imageUrl?: string;
      status?: PhotoStatus;
      display_order?: number;
    }
  ): Promise<{ photo?: CommunityPhoto; error?: string }> {
    const user = await this.getCurrentUser();
    if (!user) return { error: 'Non authentifié' };

    let newImageUrl = updates.imageUrl?.trim();
    if (updates.file) {
      if (isSupabaseConfigured() && supabase && !user.isDemo) {
        try {
          const fileExt = updates.file.name.split('.').pop() || 'webp';
          const fileName = `official/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('province-photos')
            .upload(fileName, updates.file, {
              contentType: updates.file.type || 'image/webp',
              cacheControl: '3600',
              upsert: false,
            });
          if (!uploadError && uploadData) {
            const { data: urlData } = supabase.storage.from('province-photos').getPublicUrl(uploadData.path);
            newImageUrl = urlData.publicUrl;
          }
        } catch (e) {
          console.warn('Erreur Supabase Storage upload, repli vers DataURL', e);
        }
      }
      if (!newImageUrl) {
        newImageUrl = await this.fileToDataUrl(updates.file);
      }
    }

    // Récupérer photo locale ou seeded
    this.ensureCatalogSeeded();
    const locals = this.getLocalPhotos();
    let photo = locals.find((p) => p.id === id);

    const updatedRow: Partial<CommunityPhoto> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.title !== undefined) updatedRow.title = updates.title.trim();
    if (updates.location !== undefined) updatedRow.location = updates.location.trim();
    if (updates.caption !== undefined) updatedRow.caption = updates.caption.trim();
    if (updates.provinceId !== undefined) updatedRow.province_id = updates.provinceId;
    if (updates.backgroundColor !== undefined) updatedRow.background_color = updates.backgroundColor.trim();
    if (newImageUrl) updatedRow.image_url = newImageUrl;
    if (updates.status !== undefined) updatedRow.status = updates.status;
    if (updates.display_order !== undefined) updatedRow.display_order = updates.display_order;

    if (isSupabaseConfigured() && supabase && !user.isDemo) {
      await supabase.from('community_photos').update(updatedRow).eq('id', id);
    }

    if (photo) {
      Object.assign(photo, updatedRow);
    } else {
      // Si la photo provenait de provinces.ts sans encore être en local
      const provPhoto = provinces.flatMap((pr) => pr.photos).find((ph) => ph.id === id);
      if (provPhoto) {
        const prov = provinces.find((pr) => pr.photos.some((ph) => ph.id === id));
        photo = {
          id: provPhoto.id,
          user_id: user.id,
          user_name: 'Patrimoine MVETT',
          province_id: updates.provinceId || prov?.id || 'estuaire',
          title: updates.title !== undefined ? updates.title.trim() : provPhoto.title,
          location: updates.location !== undefined ? updates.location.trim() : provPhoto.location,
          caption: updates.caption !== undefined ? updates.caption.trim() : (provPhoto.caption || ''),
          image_url: newImageUrl || provPhoto.image,
          background_color: updates.backgroundColor || provPhoto.backgroundColor,
          is_official: true,
          display_order: updates.display_order ?? 0,
          status: updates.status || 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        locals.push(photo);
      }
    }

    try {
      localStorage.setItem(LOCAL_PHOTOS_KEY, JSON.stringify(locals));
    } catch (e) {
      console.warn('LocalStorage error on update', e);
    }

    if (photo) {
      this.dispatchCatalogEvents(photo);
      return { photo };
    }

    return { error: 'Photographie non trouvée' };
  }

  public async reorderCatalogPhotos(provinceId: string, orderedIds: string[]): Promise<{ success: boolean; error?: string }> {
    this.ensureCatalogSeeded();
    const locals = this.getLocalPhotos();

    orderedIds.forEach((id, index) => {
      const p = locals.find((item) => item.id === id);
      if (p) {
        p.display_order = index;
      }
    });

    try {
      localStorage.setItem(LOCAL_PHOTOS_KEY, JSON.stringify(locals));
    } catch (e) {
      console.warn('LocalStorage error on reorder', e);
    }

    const user = await this.getCurrentUser();
    if (isSupabaseConfigured() && supabase && user && !user.isDemo) {
      for (let i = 0; i < orderedIds.length; i++) {
        await supabase.from('community_photos').update({ display_order: i }).eq('id', orderedIds[i]);
      }
    }

    this.dispatchCatalogEvents();
    return { success: true };
  }

  public async archiveCatalogPhoto(photoId: string): Promise<{ success: boolean; error?: string }> {
    return this.updatePhotoStatus(photoId, 'archived');
  }

  public async restoreCatalogPhoto(photoId: string): Promise<{ success: boolean; error?: string }> {
    return this.updatePhotoStatus(photoId, 'approved');
  }

  private async updatePhotoStatus(photoId: string, status: PhotoStatus): Promise<{ success: boolean; error?: string }> {
    const user = await this.getCurrentUser();
    if (!user) return { success: false, error: 'Non authentifié' };

    if (isSupabaseConfigured() && supabase && !user.isDemo) {
      const { error } = await supabase
        .from('community_photos')
        .update({ status, approved_at: status === 'approved' ? new Date().toISOString() : undefined })
        .eq('id', photoId);
      if (error) return { success: false, error: error.message };
    }

    this.ensureCatalogSeeded();
    const locals = this.getLocalPhotos();
    let target = locals.find((p) => p.id === photoId);
    if (!target) {
      // Si photo provenant de provinces.ts
      const provPhoto = provinces.flatMap((pr) => pr.photos).find((ph) => ph.id === photoId);
      const prov = provinces.find((pr) => pr.photos.some((ph) => ph.id === photoId));
      if (provPhoto && prov) {
        target = {
          id: provPhoto.id,
          user_id: user.id,
          user_name: 'Patrimoine MVETT',
          province_id: prov.id,
          title: provPhoto.title,
          location: provPhoto.location,
          caption: provPhoto.caption || '',
          image_url: provPhoto.image,
          background_color: provPhoto.backgroundColor,
          is_official: true,
          display_order: 0,
          status,
          created_at: new Date().toISOString(),
        };
        locals.push(target);
      }
    }

    if (target) {
      target.status = status;
      if (status === 'approved') target.approved_at = new Date().toISOString();
      try {
        localStorage.setItem(LOCAL_PHOTOS_KEY, JSON.stringify(locals));
      } catch (e) {
        console.warn('LocalStorage error on status update', e);
      }
    }

    this.dispatchCatalogEvents(target);
    return { success: true };
  }

  private dispatchCatalogEvents(detail?: unknown): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mvett:catalog-updated', { detail }));
      window.dispatchEvent(new CustomEvent('mvett:photos-updated', { detail }));
    }
  }

  private getDeletedPhotoIds(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem(DELETED_PHOTOS_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }

  private markPhotoDeleted(photoId: string): void {
    if (typeof window === 'undefined') return;
    const set = this.getDeletedPhotoIds();
    set.add(photoId);
    try {
      localStorage.setItem(DELETED_PHOTOS_KEY, JSON.stringify(Array.from(set)));
    } catch (e) {
      console.warn('LocalStorage error on mark deleted', e);
    }
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
    const trimmed = photos.slice(0, 100);
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
