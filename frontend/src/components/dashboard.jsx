import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './dashboard.css';

const SAMPLE_STATS_KEYS = [
  { labelKey: 'user.submitted', value: '12' },
  { labelKey: 'user.inReview', value: '3' },
  { labelKey: 'user.published', value: '9' },
  { labelKey: 'user.downloadsCount', value: '156' },
];

const SAMPLE_RECENTS = [
  { id: 1, title: 'Impact des changements climatiques...', statusKey: 'user.published', date: '2024-01-10' },
  { id: 2, title: 'Analyse SIG pour la gestion...', statusKey: 'user.inReview', date: '2024-01-08' },
];

function Dashboard() {
  const { t } = useTranslation();
  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1 className="dashboard__title">{t('user.dashboard')}</h1>
        <p className="dashboard__subtitle">{t('user.dashboardSubtitle')}</p>
      </header>
      <div className="dashboard__grid">
        {SAMPLE_STATS_KEYS.map((stat) => (
          <div key={stat.labelKey} className="dashboard__stat">
            <div className="dashboard__stat-label">{t(stat.labelKey)}</div>
            <div className="dashboard__stat-value">{stat.value}</div>
          </div>
        ))}
      </div>
      <section className="dashboard__section">
        <h2 className="dashboard__section-title">{t('user.recentPublications')}</h2>
        <ul className="dashboard__list">
          {SAMPLE_RECENTS.map((item) => (
            <li key={item.id} className="dashboard__list-item">
              <div>
                <strong>{item.title}</strong>
                <span className="dashboard__list-meta"> — {t(item.statusKey)} · {item.date}</span>
              </div>
              <Link to={`/publication/${item.id}`} className="dashboard__list-link">{t('user.view')}</Link>
            </li>
          ))}
        </ul>
        <div className="dashboard__actions">
          <Link to="/submit" className="dashboard__btn">{t('user.submitPublication')}</Link>
          <Link to="/librairie" className="dashboard__btn dashboard__btn--outline">{t('user.exploreLibrary')}</Link>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
