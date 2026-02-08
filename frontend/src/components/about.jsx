import { ArrowRight, Award, Globe, Users, BookOpen, Zap, ShieldCheck, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from 'components/ui/button';
import AfricadataHeader from 'components/layout/AfricadataHeader';


export default function About() {
  const team = [
    {
      name: 'PHD. ROGER',
      role: 'Fondateur & Directeur',
      bio: 'Expert en systèmes d\'information scientifique',
      image: '/roger.png'
    },
    {
      name: 'Prof. ROGER',
      role: 'Directeur Salle du Numérique UNILU',
      bio: 'Chercheur en données ouvertes',
      image: '/roger.png'
    },
    {
      name: 'RACHEL',
      role: 'Directrice Technique',
      bio: 'Architecte infrastructure numérique',
      image: null
    },
    {
      name: 'Danny LABULU IBAM',
      role: 'Ir en génie informatique et IA',
      bio: 'Spécialiste en IA et DevOps',
      image: '/danny.png'
    }
  ];

  const stats = [
    { number: '12+', label: 'Domaines scientifiques', icon: Globe },
    { number: '5000+', label: 'Publications actives', icon: BookOpen },
    { number: '2000+', label: 'Chercheurs inscrits', icon: Users },
    { number: '50+', label: 'Institutions partenaires', icon: Award }
  ];

  const values = [
    {
      icon: Globe,
      title: 'Accessibilité',
      description: 'Rendre la science africaine accessible à tous sans barrières géographiques ou économiques.'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Utiliser les technologies les plus modernes pour promouvoir la recherche scientifique.'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Créer des espaces d\'échange et de collaboration entre chercheurs africains.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Maintenir les plus hauts standards de qualité et de rigueur scientifique.'
    }
  ];

  const pillars = [
    {
      icon: Globe,
      title: 'Portée Africaine',
      description: 'Accédez à des données scientifiques issues de toutes les régions du continent africain.'
    },
    {
      icon: ShieldCheck,
      title: 'Données Validées',
      description: 'Chaque contenu est vérifié par des comités scientifiques et des experts sectoriels.'
    },
    {
      icon: Zap,
      title: 'Indexation Rapide',
      description: 'Publication instantanée et moteur de recherche avancé pour retrouver en quelques secondes les travaux pertinents.'
    },
    {
      icon: BarChart3,
      title: 'Analytics Complets',
      description: 'Mesurez l’impact, les téléchargements et la portée continentale de vos publications.'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Mettez en relation des chercheurs, laboratoires et universités africaines autour de projets communs.'
    },
    {
      icon: BookOpen,
      title: 'Open Access',
      description: 'Diffusion en accès ouvert pour maximiser la visibilité et l’impact de la recherche africaine.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AfricadataHeader />

      <main className="flex-1">
        {/* Hero Section - fond transparent avec motif science & données */}
        <section className="about-hero py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <img src="/logo.png" alt="AfricaData" className="about-hero-logo mx-auto mb-6" />
              <h1 className="about-hero-title text-4xl md:text-5xl font-bold mb-4">À Propos d'AfricaData</h1>
              <p className="about-hero-subtitle text-xl max-w-2xl mx-auto">
                Le centre numérique africain de collecte, validation et diffusion de données scientifiques
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Notre Mission</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  AfricaData est une plateforme numérique innovante dédiée à la promotion et à la diffusion de la recherche scientifique africaine. Nous croyons que la science africaine doit avoir une visibilité mondiale et un impact durable.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  Notre mission est de créer un écosystème numérique intégré où chercheurs, académiciens et professionnels peuvent collaborer, partager leurs découvertes et contribuer au progrès scientifique du continent.
                </p>
                <Link to="/librairie">
                  <Button className="btn-primary inline-flex items-center gap-2">
                    Découvrir nos publications <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="bg-muted/30 rounded-lg p-8 flex items-center justify-center min-h-96">
                <img src="/logo.png" alt="Mission AfricaData" className="about-mission-logo opacity-60" />
              </div>
            </div>
          </div>
        </section>

        {/* Pillars Section */}
        <section className="py-16 md:py-24 bg-muted/5">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Nos Fondamentaux
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {pillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={idx}
                    className="africadata-card relative flex items-start gap-4 overflow-hidden rounded-2xl border border-red-100 bg-white/95"
                  >
                    <span
                      className="pointer-events-none absolute -top-12 right-0 h-36 w-36 rounded-[40%] bg-red-200/60 blur-3xl"
                      aria-hidden
                    />
                    <span
                      className="pointer-events-none absolute -bottom-14 left-3 h-28 w-28 rounded-[45%] bg-red-100/50 blur-2xl"
                      aria-hidden
                    />
                    <div className="relative inline-flex flex-shrink-0">
                      <span className="absolute inset-0 rounded-2xl bg-red-200/60 blur-xl" aria-hidden />
                      <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-white text-red-700 shadow-[0_18px_40px_rgba(196,22,28,0.25)]">
                        <Icon className="h-7 w-7" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="relative">
                      <h3 className="text-xl font-semibold text-red-700 mb-1">{pillar.title}</h3>
                      <p className="text-sm text-red-600/80">{pillar.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-24 bg-muted/10">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Nos Valeurs</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, idx) => {
                const Icon = value.icon;
                return (
                  <div
                    key={idx}
                    className="africadata-card relative overflow-hidden rounded-2xl border border-red-100 bg-white/95 p-6"
                  >
                    <span
                      className="pointer-events-none absolute -top-10 right-0 h-32 w-32 rounded-[40%] bg-red-200/60 blur-3xl"
                      aria-hidden
                    />
                    <span
                      className="pointer-events-none absolute -bottom-12 left-2 h-24 w-24 rounded-[45%] bg-red-100/50 blur-2xl"
                      aria-hidden
                    />
                    <div className="relative inline-flex">
                      <span className="absolute inset-0 rounded-2xl bg-red-200/60 blur-xl" aria-hidden />
                      <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-white text-red-700 shadow-[0_18px_40px_rgba(196,22,28,0.25)]">
                        <Icon className="h-7 w-7" />
                      </span>
                    </div>
                    <div className="relative mt-4">
                      <h3 className="text-lg font-semibold text-red-700">{value.title}</h3>
                      <p className="mt-1 text-sm text-red-600/80">{value.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">En Chiffres</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="relative overflow-hidden rounded-2xl border border-red-100 bg-white/95 p-6 text-center"
                  >
                    <span
                      className="pointer-events-none absolute -top-10 right-0 h-32 w-32 rounded-[40%] bg-red-200/60 blur-3xl"
                      aria-hidden
                    />
                    <span
                      className="pointer-events-none absolute -bottom-12 left-2 h-28 w-28 rounded-[45%] bg-red-100/50 blur-2xl"
                      aria-hidden
                    />
                    <div className="relative inline-flex mb-4">
                      <span className="absolute inset-0 rounded-2xl bg-red-200/60 blur-xl" aria-hidden />
                      <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-white text-red-700 shadow-[0_18px_40px_rgba(196,22,28,0.25)]">
                        <Icon className="h-7 w-7" />
                      </span>
                    </div>
                    <div className="relative text-4xl font-bold text-red-700 mb-2">{stat.number}</div>
                    <p className="relative text-sm font-medium text-red-600/80">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 md:py-24 bg-muted/10">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Notre Équipe</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, idx) => (
                <div key={idx} className="africadata-card text-center">
                  <div className="mb-4 flex justify-center">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="rounded-full object-cover w-14 h-14 md:w-16 md:h-16" />
                    ) : (
                      <div className="rounded-full bg-muted/50 flex items-center justify-center text-muted w-14 h-14 md:w-16 md:h-16">
                        <Users className="w-6 h-6 md:w-7 md:h-7" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-1">{member.name}</h3>
                  <p className="text-sm text-primary font-semibold mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-primary text-white">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Rejoignez Notre Communauté</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Devenez part de la révolution scientifique africaine. Partagez vos recherches avec le monde.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/inscription">
                <Button className="bg-white text-primary hover:bg-white/90 inline-flex items-center gap-2">
                  S'inscrire maintenant <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/librairie">
                <Button variant="outline" className="border-white text-white hover:bg-white/10 inline-flex items-center gap-2">
                  Explorer les publications <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
