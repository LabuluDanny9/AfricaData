-- AfricaData — Schéma Supabase
-- Exécuter dans l’éditeur SQL du projet Supabase (Dashboard > SQL Editor)

-- ========== Extensions ==========
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== Profils (lié à auth.users) ==========
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  location TEXT,
  website TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  institution TEXT,
  domain_interest TEXT,
  role TEXT DEFAULT 'chercheur' CHECK (role IN ('chercheur', 'lecteur', 'editeur', 'institution', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profils lisibles par tous"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Utilisateur peut mettre à jour son profil"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Utilisateur peut insérer son profil"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger: créer un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'chercheur')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== Publications ==========
CREATE TABLE IF NOT EXISTS public.publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  type TEXT NOT NULL,
  domain TEXT NOT NULL,
  language TEXT,
  region TEXT,
  year TEXT,
  summary TEXT,
  abstract TEXT,
  pdf_url TEXT,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_publications_domain ON public.publications(domain);
CREATE INDEX IF NOT EXISTS idx_publications_type ON public.publications(type);
CREATE INDEX IF NOT EXISTS idx_publications_language ON public.publications(language);
CREATE INDEX IF NOT EXISTS idx_publications_region ON public.publications(region);
CREATE INDEX IF NOT EXISTS idx_publications_year ON public.publications(year);
CREATE INDEX IF NOT EXISTS idx_publications_created_at ON public.publications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_publications_search ON public.publications USING gin(
  to_tsvector('french', coalesce(title,'') || ' ' || coalesce(author,'') || ' ' || coalesce(summary,''))
);

ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Publications publiées lisibles par tous"
  ON public.publications FOR SELECT USING (status = 'published' OR user_id = auth.uid());

CREATE POLICY "Authentifié peut créer une publication"
  ON public.publications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auteur peut modifier sa publication"
  ON public.publications FOR UPDATE USING (user_id = auth.uid());

-- ========== Notes (ratings) ==========
CREATE TABLE IF NOT EXISTS public.publication_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value >= 1 AND value <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(publication_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_publication ON public.publication_ratings(publication_id);

ALTER TABLE public.publication_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notes lisibles par tous"
  ON public.publication_ratings FOR SELECT USING (true);

CREATE POLICY "Authentifié peut noter"
  ON public.publication_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateur peut modifier sa note"
  ON public.publication_ratings FOR UPDATE USING (auth.uid() = user_id);

-- Fonction: recalculer rating_avg et rating_count sur une publication
CREATE OR REPLACE FUNCTION public.update_publication_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.publications p
  SET
    rating_avg = (SELECT COALESCE(AVG(value), 0) FROM public.publication_ratings WHERE publication_id = COALESCE(NEW.publication_id, OLD.publication_id)),
    rating_count = (SELECT COUNT(*) FROM public.publication_ratings WHERE publication_id = COALESCE(NEW.publication_id, OLD.publication_id)),
    updated_at = now()
  WHERE p.id = COALESCE(NEW.publication_id, OLD.publication_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_rating_change ON public.publication_ratings;
CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON public.publication_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_publication_rating();

-- ========== Commentaires ==========
CREATE TABLE IF NOT EXISTS public.publication_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_publication ON public.publication_comments(publication_id);

ALTER TABLE public.publication_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Commentaires lisibles par tous"
  ON public.publication_comments FOR SELECT USING (true);

CREATE POLICY "Authentifié peut commenter"
  ON public.publication_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ========== Favoris ==========
CREATE TABLE IF NOT EXISTS public.favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, publication_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateur voit ses favoris"
  ON public.favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Utilisateur peut ajouter/retirer favori"
  ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- ========== RPC : incrémenter vues (optionnel, pour éviter race condition) ==========
CREATE OR REPLACE FUNCTION public.increment_views(pub_id UUID)
RETURNS void AS $$
  UPDATE public.publications SET views = views + 1, updated_at = now() WHERE id = pub_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- ========== Données de démo (optionnel) ==========
INSERT INTO public.publications (id, title, author, type, domain, language, region, year, summary, abstract, views, downloads, rating_avg, rating_count)
VALUES
  (uuid_generate_v4(), 'Impact des changements climatiques sur l''agriculture durable', 'Prof. Jean-Marie Kabongo', 'Article', 'Sciences agronomiques', 'Français', 'Afrique', '2024', 'Cette étude analyse les effets des changements climatiques sur les pratiques agricoles durables en Afrique centrale.', 'Cette étude analyse les effets des changements climatiques sur les pratiques agricoles durables en Afrique centrale. Elle propose des recommandations pour l''adaptation des systèmes de production.', 342, 89, 4.5, 12),
  (uuid_generate_v4(), 'Analyse SIG pour la gestion des ressources naturelles', 'Dr. Patrick Mbuya', 'Thèse', 'Ingénierie', 'Français', 'Afrique', '2024', 'Travail de recherche sur l''utilisation des systèmes d''information géographique.', 'Travail de recherche sur l''utilisation des systèmes d''information géographique pour une gestion durable des ressources naturelles.', 156, 45, 4.8, 8),
  (uuid_generate_v4(), 'Étude épidémiologique des maladies tropicales négligées', 'Prof. Christine Mulamba', 'Rapport', 'Médecine & Santé', 'Français', 'Afrique', '2024', 'Rapport d''enquête épidémiologique sur les maladies tropicales négligées.', 'Rapport d''enquête épidémiologique sur les maladies tropicales négligées dans plusieurs régions.', 521, 120, 4.2, 15),
  (uuid_generate_v4(), 'L''entrepreneuriat féminin comme levier de développement local', 'Prof. Jeanne Mutombo', 'Article', 'Sciences économiques', 'Français', 'Afrique', '2024', 'Analyse du rôle de l''entrepreneuriat féminin.', 'Analyse du rôle de l''entrepreneuriat féminin dans le développement économique local en Afrique subsaharienne.', 678, 98, 4.6, 22),
  (uuid_generate_v4(), 'Intelligence artificielle et diagnostic médical', 'Dr. Amara Okonkwo', 'Article', 'IA & Data Science', 'English', 'International', '2025', 'Application des modèles de deep learning pour l''aide au diagnostic.', 'Application des modèles de deep learning pour l''aide au diagnostic des pathologies tropicales.', 890, 234, 4.9, 18)
;
