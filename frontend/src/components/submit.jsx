import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPublication } from 'services/publications';
import { useAuth } from 'context/AuthContext';
import { isSupabaseConfigured } from 'lib/supabase';
import './submit.css';

function Submit() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error: err } = await createPublication({
          title: title.trim(),
          author: author.trim() || user?.name || 'Anonyme',
          summary: description.trim(),
          description: description.trim(),
        });
        if (err) throw err;
        setSuccess(true);
        if (data?.id) setTimeout(() => navigate(`/publication/${data.id}`), 1500);
      } else {
        setError('Soumission non configurée. Configurez Supabase (voir .env.example).');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la soumission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit">
      <div className="submit__container">
        <div className="submit__card">
          <h1 className="submit__title">Soumettre une publication</h1>
          <p className="submit__subtitle">Remplissez le formulaire ci-dessous</p>
          {success && <p className="submit__success text-success mb-3">Publication enregistrée. Redirection…</p>}
          {error && <p className="submit__error text-danger small mb-3">{error}</p>}
          <form className="submit__form" onSubmit={handleSubmit}>
            <div className="submit__field">
              <label className="submit__label" htmlFor="title">Titre</label>
              <input id="title" type="text" className="submit__input" placeholder="Titre de la publication" required value={title} onChange={(e) => setTitle(e.target.value)} disabled={loading} />
            </div>
            <div className="submit__field">
              <label className="submit__label" htmlFor="author">Auteur(s)</label>
              <input id="author" type="text" className="submit__input" placeholder="Nom(s) des auteurs" value={author} onChange={(e) => setAuthor(e.target.value)} disabled={loading} />
            </div>
            <div className="submit__field">
              <label className="submit__label" htmlFor="description">Description / Résumé</label>
              <textarea id="description" className="submit__textarea" placeholder="Description ou résumé..." value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} />
            </div>
            <div className="submit__actions">
              <button type="submit" className="submit__submit" disabled={loading}>{loading ? 'Envoi…' : 'Soumettre'}</button>
              <Link to="/" className="submit__cancel">Annuler</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Submit;
