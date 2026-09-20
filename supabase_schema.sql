-- ==============================================================================
-- MVETT — Configuration Supabase Sécurisée & Durcie (RBAC, Modération & Stockage)
-- Exécutez ce script complet dans le "SQL Editor" de votre tableau de bord Supabase
-- ==============================================================================

-- 1. Table de Gestion des Rôles (RBAC - Role-Based Access Control)
-- Évite le codage en dur d'adresses email dans les règles RLS
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'moderator')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT user_roles_user_id_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles (role);

-- Activer RLS sur la table des rôles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Fonctions utilitaires sécurisées (SECURITY DEFINER avec search_path restreint)
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = p_user_id AND role = 'admin'
    );
$$;

CREATE OR REPLACE FUNCTION public.is_moderator(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = p_user_id AND role IN ('admin', 'moderator')
    );
$$;

-- Politiques RLS pour user_roles
DROP POLICY IF EXISTS "Lecture de son propre rôle ou par un administrateur" ON public.user_roles;
DROP POLICY IF EXISTS "Gestion des rôles réservée aux administrateurs" ON public.user_roles;

CREATE POLICY "Lecture de son propre rôle ou par un administrateur"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id OR public.is_admin(auth.uid())
    );

CREATE POLICY "Gestion des rôles réservée aux administrateurs"
    ON public.user_roles
    FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- Migration / Amorçage initial de l'administrateur
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'alloghofrederic9@gmail.com' LIMIT 1;
    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_user_id, 'admin')
        ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
    END IF;
END $$;

-- 2. Création et mise à niveau de la table des photos
CREATE TABLE IF NOT EXISTS public.community_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    province_id TEXT NOT NULL, -- e.g. 'estuaire', 'haut-ogooue', etc.
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    caption TEXT,
    image_url TEXT NOT NULL,
    background_color TEXT DEFAULT '#1b2c34',
    is_official BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexation optimisée
CREATE INDEX IF NOT EXISTS idx_community_photos_province ON public.community_photos (province_id);
CREATE INDEX IF NOT EXISTS idx_community_photos_status ON public.community_photos (status);
CREATE INDEX IF NOT EXISTS idx_community_photos_official ON public.community_photos (is_official);
CREATE INDEX IF NOT EXISTS idx_community_photos_order ON public.community_photos (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_community_photos_created_at ON public.community_photos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_photos_user_id ON public.community_photos (user_id);

-- 3. Triggers de Sécurité et d'Intégrité des Données

-- Trigger 1 : Verrouillage et désinfection de la modération (anti-contournement)
CREATE OR REPLACE FUNCTION public.handle_photo_moderation_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Si l'utilisateur n'est pas admin, statut forcé à 'pending' et non-officiel
        IF NOT public.is_admin(auth.uid()) THEN
            NEW.status := 'pending';
            NEW.is_official := false;
            NEW.approved_at := NULL;
        ELSIF NEW.status = 'approved' AND NEW.approved_at IS NULL THEN
            NEW.approved_at := now();
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Si non-admin, interdiction absolue de modifier les colonnes d'administration ou de propriété
        IF NOT public.is_admin(auth.uid()) THEN
            IF NEW.status IS DISTINCT FROM OLD.status OR
               NEW.is_official IS DISTINCT FROM OLD.is_official OR
               NEW.approved_at IS DISTINCT FROM OLD.approved_at OR
               NEW.user_id IS DISTINCT FROM OLD.user_id OR
               NEW.created_at IS DISTINCT FROM OLD.created_at THEN
                RAISE EXCEPTION 'Tentative d''escalade de privilèges : seuls les administrateurs peuvent modifier le statut, la certification officielle ou l''assignation des photos.';
            END IF;
        ELSE
            -- Si l'admin approuve la photo et que approved_at n'est pas renseigné
            IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.approved_at IS NULL THEN
                NEW.approved_at := now();
            END IF;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_photo_moderation_guard ON public.community_photos;
CREATE TRIGGER trg_photo_moderation_guard
    BEFORE INSERT OR UPDATE ON public.community_photos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_photo_moderation_guard();

-- Trigger 2 : Quota anti-spam / anti-inondation (Max 5 photos en attente par utilisateur)
CREATE OR REPLACE FUNCTION public.check_photo_submission_quota()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_pending_count INTEGER;
BEGIN
    IF NOT public.is_admin(auth.uid()) THEN
        SELECT COUNT(*) INTO v_pending_count
        FROM public.community_photos
        WHERE user_id = NEW.user_id AND status = 'pending';

        IF v_pending_count >= 5 THEN
            RAISE EXCEPTION 'Quota dépassé : vous avez déjà 5 photos en attente de modération. Veuillez attendre leur validation avant d''en publier de nouvelles.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_photo_submission_quota ON public.community_photos;
CREATE TRIGGER trg_check_photo_submission_quota
    BEFORE INSERT ON public.community_photos
    FOR EACH ROW
    EXECUTE FUNCTION public.check_photo_submission_quota();

-- Trigger 3 : Nettoyage automatique des fichiers de stockage orphelins lors de la suppression
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_photo_storage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_file_path TEXT;
    v_bucket_id TEXT := 'province-photos';
BEGIN
    IF OLD.image_url LIKE '%' || v_bucket_id || '/%' THEN
        v_file_path := split_part(OLD.image_url, v_bucket_id || '/', 2);
        v_file_path := split_part(v_file_path, '?', 1);
        IF v_file_path IS NOT NULL AND length(v_file_path) > 0 THEN
            DELETE FROM storage.objects
            WHERE bucket_id = v_bucket_id AND name = v_file_path;
        END IF;
    END IF;
    RETURN OLD;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Avertissement nettoyage stockage : %', SQLERRM;
        RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_cleanup_orphaned_photo_storage ON public.community_photos;
CREATE TRIGGER trg_cleanup_orphaned_photo_storage
    AFTER DELETE ON public.community_photos
    FOR EACH ROW
    EXECUTE FUNCTION public.cleanup_orphaned_photo_storage();

-- 4. Activation de la sécurité au niveau des lignes (Row Level Security - RLS)
ALTER TABLE public.community_photos ENABLE ROW LEVEL SECURITY;

-- Nettoyage des anciennes politiques
DROP POLICY IF EXISTS "Les photos sont consultables par tout le monde" ON public.community_photos;
DROP POLICY IF EXISTS "Les photos approuvées sont consultables par tout le monde" ON public.community_photos;
DROP POLICY IF EXISTS "Lecture des photos approuvées ou par l'auteur ou l'admin" ON public.community_photos;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent publier une photo" ON public.community_photos;
DROP POLICY IF EXISTS "Insertion de photos par les utilisateurs authentifiés" ON public.community_photos;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres photos" ON public.community_photos;
DROP POLICY IF EXISTS "Suppression par l'auteur ou l'administrateur" ON public.community_photos;
DROP POLICY IF EXISTS "Mise à jour du statut par l'administrateur" ON public.community_photos;
DROP POLICY IF EXISTS "Mise à jour par l'auteur ou l'administrateur" ON public.community_photos;

-- Politique 1 : Tout le monde peut voir les photos approuvées. Les auteurs voient leurs photos en attente. Les admins voient tout.
CREATE POLICY "Lecture des photos approuvées ou par l'auteur ou l'admin"
    ON public.community_photos
    FOR SELECT
    USING (
        status = 'approved' 
        OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR public.is_admin(auth.uid())
    );

-- Politique 2 : Seuls les utilisateurs authentifiés peuvent publier une photo pour leur propre compte
CREATE POLICY "Insertion de photos par les utilisateurs authentifiés"
    ON public.community_photos
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Politique 3 : L'auteur peut modifier les informations de sa photo (protégé par le trigger), l'admin peut tout modifier
CREATE POLICY "Mise à jour par l'auteur ou l'administrateur"
    ON public.community_photos
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = user_id OR public.is_admin(auth.uid())
    )
    WITH CHECK (
        auth.uid() = user_id OR public.is_admin(auth.uid())
    );

-- Politique 4 : L'auteur ou l'administrateur peut supprimer la photo (déclenche le trigger de nettoyage du stockage)
CREATE POLICY "Suppression par l'auteur ou l'administrateur"
    ON public.community_photos
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = user_id OR public.is_admin(auth.uid())
    );

-- 5. Configuration et Durcissement du Bucket de Stockage
-- Limite à 5 Mo et restreint aux formats d'images sécurisés (JPEG, PNG, WebP)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'province-photos',
    'province-photos',
    true,
    5242880, -- 5 Mo
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- RLS pour le bucket de stockage
DROP POLICY IF EXISTS "Lecture publique des photos" ON storage.objects;
DROP POLICY IF EXISTS "Téléversement par les utilisateurs authentifiés" ON storage.objects;
DROP POLICY IF EXISTS "Suppression par l'auteur" ON storage.objects;
DROP POLICY IF EXISTS "Suppression par l'auteur ou l'administrateur" ON storage.objects;

CREATE POLICY "Lecture publique des photos"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'province-photos');

CREATE POLICY "Téléversement par les utilisateurs authentifiés"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'province-photos' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Suppression par l'auteur ou l'administrateur"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'province-photos' 
        AND (
            (storage.foldername(name))[1] = auth.uid()::text 
            OR public.is_admin(auth.uid())
        )
    );
