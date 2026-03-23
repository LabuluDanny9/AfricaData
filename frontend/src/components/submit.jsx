import { Link } from 'react-router-dom';
import './submit.css';

function Submit() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: envoi API soumission
  };

  return (
    <div className="submit">
      <div className="submit__container">
        <div className="submit__card">
          <h1 className="submit__title">Soumettre une publication</h1>
          <p className="submit__subtitle">Remplissez le formulaire ci-dessous</p>
          <form className="submit__form" onSubmit={handleSubmit}>
            <div className="submit__field">
              <label className="submit__label" htmlFor="title">Titre</label>
              <input id="title" type="text" className="submit__input" placeholder="Titre de la publication" required />
            </div>
            <div className="submit__field">
              <label className="submit__label" htmlFor="description">Description</label>
              <textarea id="description" className="submit__textarea" placeholder="Description..." />
            </div>
            <div className="submit__actions">
              <button type="submit" className="submit__submit">Soumettre</button>
              <Link to="/" className="submit__cancel">Annuler</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Submit;
