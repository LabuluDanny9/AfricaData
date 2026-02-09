import { ArrowRight, Award, Globe, Users, BookOpen, Zap, ShieldCheck, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from 'components/ui/button';
import { useTranslation } from 'react-i18next';
import AfricadataHeader from 'components/layout/AfricadataHeader';

export default function About() {
  const { t } = useTranslation();

  const team = [
    { name: 'HERVE DUBOIS', roleKey: 'about.team1Role', bioKey: 'about.team1Bio', image: null },
    { name: 'CEDRIC DE SABRE', roleKey: 'about.team2Role', bioKey: 'about.team2Bio', image: null },
    { name: 'RACHEL', roleKey: 'about.team3Role', bioKey: 'about.team3Bio', image: null },
    { name: 'Danny LABULU IBAM', roleKey: 'about.team4Role', bioKey: 'about.team4Bio', image: '/danny.png' },
  ];

  const stats = [
    { number: '12+', labelKey: 'about.stat1Label', icon: Globe },
    { number: '5000+', labelKey: 'about.stat2Label', icon: BookOpen },
    { number: '2000+', labelKey: 'about.stat3Label', icon: Users },
    { number: '50+', labelKey: 'about.stat4Label', icon: Award },
  ];

  const values = [
    { icon: Globe, titleKey: 'about.value1Title', descKey: 'about.value1Desc' },
    { icon: Zap, titleKey: 'about.value2Title', descKey: 'about.value2Desc' },
    { icon: Users, titleKey: 'about.value3Title', descKey: 'about.value3Desc' },
    { icon: Award, titleKey: 'about.value4Title', descKey: 'about.value4Desc' },
  ];

  const pillars = [
    { icon: Globe, titleKey: 'about.pillar1Title', descKey: 'about.pillar1Desc' },
    { icon: ShieldCheck, titleKey: 'about.pillar2Title', descKey: 'about.pillar2Desc' },
    { icon: Zap, titleKey: 'about.pillar3Title', descKey: 'about.pillar3Desc' },
    {
      icon: BarChart3,
      titleKey: 'about.pillar4Title',
      descKey: 'about.pillar4Desc',
      _oldDesc: 'Mesurez l’impact, les téléchargements et la portée continentale de vos publications.'
    },
    { icon: Users, titleKey: 'about.pillar5Title', descKey: 'about.pillar5Desc' },
    {
      icon: BookOpen,
      titleKey: 'about.pillar6Title',
      descKey: 'about.pillar6Desc',
      _oldDesc: 'Diffusion en accès ouvert pour maximiser la visibilité et l’impact de la recherche africaine.'
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
              <h1 className="about-hero-title text-4xl md:text-5xl font-bold mb-4">{t('about.heroTitle')}</h1>
              <p className="about-hero-subtitle text-xl max-w-2xl mx-auto">
                {t('about.heroSubtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">{t('about.missionTitle')}</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  {t('about.missionText1')}
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  {t('about.missionText2')}
                </p>
                <Link to="/librairie">
                  <Button className="btn-primary inline-flex items-center gap-2">
                    {t('about.discoverPublications')} <ArrowRight className="h-4 w-4" />
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
              {t('about.pillarsTitle')}
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
                      <h3 className="text-xl font-semibold text-red-700 mb-1">{t(pillar.titleKey)}</h3>
                      <p className="text-sm text-red-600/80">{t(pillar.descKey)}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('about.valuesTitle')}</h2>
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
                      <h3 className="text-lg font-semibold text-red-700">{t(value.titleKey)}</h3>
                      <p className="mt-1 text-sm text-red-600/80">{t(value.descKey)}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('about.statsTitle')}</h2>
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
                    <p className="relative text-sm font-medium text-red-600/80">{t(stat.labelKey)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 md:py-24 bg-muted/10">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('about.teamTitle')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, idx) => (
                <div key={idx} className="africadata-card text-center">
                  <div className="mb-4 flex justify-center">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="rounded-full object-cover w-12 h-12 md:w-14 md:h-14" />
                    ) : (
                      <div className="rounded-full bg-muted/50 flex items-center justify-center text-muted w-12 h-12 md:w-14 md:h-14">
                        <Users className="w-6 h-6 md:w-7 md:h-7" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-black">{member.name}</h3>
                  <p className="text-sm text-primary font-semibold mb-2">{t(member.roleKey)}</p>
                  <p className="text-sm text-muted-foreground">{t(member.bioKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-primary text-white">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('about.ctaTitle')}</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              {t('about.ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/inscription">
                <Button className="bg-white text-primary hover:bg-white/90 inline-flex items-center gap-2">
                  {t('about.signupNow')} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/librairie">
                <Button variant="outline" className="border-white text-white hover:bg-white/10 inline-flex items-center gap-2">
                  {t('about.explorePublications')} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
