-- ==============================================================================
-- MVETT — Configuration Supabase (Base de données & Stockage)
-- Exécutez ce script complet dans le "SQL Editor" de votre tableau de bord Supabase
-- ==============================================================================

-- 1. Création de la table des photos communautaires
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
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexation pour des requêtes rapides par province et date
CREATE INDEX IF NOT EXISTS idx_community_photos_province ON public.community_photos (province_id);
CREATE INDEX IF NOT EXISTS idx_community_photos_created_at ON public.community_photos (created_at DESC);

-- 2. Activation de la sécurité au niveau des lignes (Row Level Security - RLS)
ALTER TABLE public.community_photos ENABLE ROW LEVEL SECURITY;

-- Politique 1 : Tout le monde (public anonyme ou connecté) peut lire les photos
CREATE POLICY "Les photos sont consultables par tout le monde"
    ON public.community_photos
    FOR SELECT
    USING (true);

-- Politique 2 : Seuls les utilisateurs authentifiés peuvent ajouter une photo
CREATE POLICY "Les utilisateurs authentifiés peuvent publier une photo"
    ON public.community_photos
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Politique 3 : Un utilisateur ne peut supprimer que ses propres photos
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres photos"
    ON public.community_photos
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 3. Configuration du Bucket de Stockage pour les images
-- Crée un bucket public nommé 'province-photos' s'il n'existe pas déjà
INSERT INTO storage.buckets (id, name, public)
VALUES ('province-photos', 'province-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS pour le bucket de stockage
-- Tout le monde peut voir/télécharger les images
CREATE POLICY "Lecture publique des photos"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'province-photos');

-- Les utilisateurs authentifiés peuvent téléverser des images
CREATE POLICY "Téléversement par les utilisateurs authentifiés"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'province-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Les utilisateurs peuvent supprimer leurs propres fichiers d'image
CREATE POLICY "Suppression par l'auteur"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'province-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
