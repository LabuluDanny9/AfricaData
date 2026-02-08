import { Link } from 'react-router-dom';
import './dashboard.css';

const SAMPLE_STATS = [
  { label: 'Publications soumises', value: '12' },
  { label: 'En révision', value: '3' },
  { label: 'Publiées', value: '9' },
  { label: 'Téléchargements', value: '156' },
];

const SAMPLE_RECENTS = [
  { id: 1, title: 'Impact des changements climatiques...', status: 'Publié', date: '2024-01-10' },
  { id: 2, title: 'Analyse SIG pour la gestion...', status: 'En révision', date: '2024-01-08' },
];

function Dashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1 className="dashboard__title">Tableau de bord</h1>
        <p className="dashboard__subtitle">Vue d'ensemble de votre activité</p>
      </header>
      <div className="dashboard__grid">
        {SAMPLE_STATS.map((stat) => (
          <div key={stat.label} className="dashboard__stat">
            <div className="dashboard__stat-label">{stat.label}</div>
            <div className="dashboard__stat-value">{stat.value}</div>
          </div>
        ))}
      </div>
      <section className="dashboard__section">
        <h2 className="dashboard__section-title">Publications récentes</h2>
        <ul className="dashboard__list">
          {SAMPLE_RECENTS.map((item) => (
            <li key={item.id} className="dashboard__list-item">
              <div>
                <strong>{item.title}</strong>
                <span className="dashboard__list-meta"> — {item.status} · {item.date}</span>
              </div>
              <Link to={`/publication/${item.id}`} className="dashboard__list-link">Voir</Link>
            </li>
          ))}
        </ul>
        <div className="dashboard__actions">
          <Link to="/submit" className="dashboard__btn">Soumettre une publication</Link>
          <Link to="/librairie" className="dashboard__btn dashboard__btn--outline">Explorer la librairie</Link>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
