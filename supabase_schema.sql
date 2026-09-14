-- ==============================================================================
-- MVETT — Configuration Supabase (Base de données, Modération & Stockage)
-- Exécutez ce script complet dans le "SQL Editor" de votre tableau de bord Supabase
-- ==============================================================================

-- 1. Création de la table des photos communautaires avec statut de modération
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
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Si la table existait déjà, ajouter les colonnes sans casser les données existantes
ALTER TABLE public.community_photos ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.community_photos ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Indexation pour des requêtes ultra rapides
CREATE INDEX IF NOT EXISTS idx_community_photos_province ON public.community_photos (province_id);
CREATE INDEX IF NOT EXISTS idx_community_photos_status ON public.community_photos (status);
CREATE INDEX IF NOT EXISTS idx_community_photos_created_at ON public.community_photos (created_at DESC);

-- 2. Activation de la sécurité au niveau des lignes (Row Level Security - RLS)
ALTER TABLE public.community_photos ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si déjà existantes pour réapplication propre
DROP POLICY IF EXISTS "Les photos sont consultables par tout le monde" ON public.community_photos;
DROP POLICY IF EXISTS "Les photos approuvées sont consultables par tout le monde" ON public.community_photos;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent publier une photo" ON public.community_photos;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres photos" ON public.community_photos;
DROP POLICY IF EXISTS "Suppression par l'auteur ou l'administrateur" ON public.community_photos;
DROP POLICY IF EXISTS "Mise à jour du statut par l'administrateur" ON public.community_photos;

-- Politique 1 : Tout le monde peut voir les photos approuvées. Les auteurs voient leurs photos en attente. L'admin voit tout.
CREATE POLICY "Les photos approuvées sont consultables par tout le monde"
    ON public.community_photos
    FOR SELECT
    USING (
        status = 'approved' 
        OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (auth.jwt() ->> 'email' = 'alloghofrederic9@gmail.com')
    );

-- Politique 2 : Seuls les utilisateurs authentifiés peuvent publier une photo (statut forcé à 'pending' par défaut)
CREATE POLICY "Les utilisateurs authentifiés peuvent publier une photo"
    ON public.community_photos
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Politique 3 : Un utilisateur peut supprimer ses propres photos, l'admin peut tout supprimer
CREATE POLICY "Suppression par l'auteur ou l'administrateur"
    ON public.community_photos
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = user_id 
        OR (auth.jwt() ->> 'email' = 'alloghofrederic9@gmail.com')
    );

-- Politique 4 : Seul l'administrateur peut modifier le statut (Approuver ou Rejeter)
CREATE POLICY "Mise à jour du statut par l'administrateur"
    ON public.community_photos
    FOR UPDATE
    TO authenticated
    USING (
        auth.jwt() ->> 'email' = 'alloghofrederic9@gmail.com'
    )
    WITH CHECK (
        auth.jwt() ->> 'email' = 'alloghofrederic9@gmail.com'
    );

-- 3. Configuration du Bucket de Stockage pour les images
INSERT INTO storage.buckets (id, name, public)
VALUES ('province-photos', 'province-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS pour le bucket de stockage
DROP POLICY IF EXISTS "Lecture publique des photos" ON storage.objects;
DROP POLICY IF EXISTS "Téléversement par les utilisateurs authentifiés" ON storage.objects;
DROP POLICY IF EXISTS "Suppression par l'auteur" ON storage.objects;

CREATE POLICY "Lecture publique des photos"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'province-photos');

CREATE POLICY "Téléversement par les utilisateurs authentifiés"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'province-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Suppression par l'auteur"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'province-photos' 
        AND ((storage.foldername(name))[1] = auth.uid()::text OR auth.jwt() ->> 'email' = 'alloghofrederic9@gmail.com')
    );
