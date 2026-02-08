import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, ListGroup, Button } from 'react-bootstrap';
import { MessageCircle, Trash2, FileText } from 'lucide-react';
import { supabase, isSupabaseConfigured } from 'lib/supabase';
import { useAuth } from 'context/AuthContext';
import './AvisCommentaires.css';

export default function AvisCommentaires() {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured() || !user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('publication_comments')
      .select('id, publication_id, content, created_at, publications(title)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setComments(data.map((c) => ({
            id: c.id,
            publication_id: c.publication_id,
            publication_title: c.publications?.title ?? 'Publication',
            content: c.content,
            date: c.created_at,
          })));
        } else {
          setComments([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setComments([]);
        setLoading(false);
      });
  }, [user?.id]);

  const handleDelete = async (commentId) => {
    if (!window.confirm('Supprimer cet avis ?')) return;
    if (isSupabaseConfigured()) {
      await supabase.from('publication_comments').delete().eq('id', commentId).eq('user_id', user?.id);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } else {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  return (
    <div className="avis-commentaires">
      <header className="mb-4">
        <h1 className="h3 fw-bold mb-1">Avis & commentaires</h1>
        <p className="text-body-secondary mb-0 small">Vos avis sur les publications</p>
      </header>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status" />
              <p className="mt-2 small text-body-secondary">Chargement…</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-5 text-body-secondary">
              <MessageCircle size={48} className="mb-2 opacity-50" />
              <p className="mb-0">Aucun commentaire.</p>
              <Link to="/librairie" className="btn btn-danger btn-sm mt-3 rounded-pill">Explorer la bibliothèque</Link>
            </div>
          ) : (
            <ListGroup variant="flush">
              {comments.map((c) => (
                <ListGroup.Item key={c.id} className="border-0 border-bottom px-4 py-3 d-flex justify-content-between align-items-start gap-3">
                  <div className="flex-grow-1 min-w-0">
                    <Link to={`/publication/${c.publication_id}`} className="fw-semibold text-body text-decoration-none small d-block mb-1">
                      <FileText size={14} className="me-1" />
                      {c.publication_title?.length > 60 ? c.publication_title.slice(0, 60) + '…' : c.publication_title}
                    </Link>
                    <p className="small text-body-secondary mb-1">{c.content}</p>
                    <span className="small text-body-secondary">{typeof c.date === 'string' ? c.date.slice(0, 16) : new Date(c.date).toLocaleString('fr-FR')}</span>
                  </div>
                  <Button variant="link" size="sm" className="text-danger p-0 flex-shrink-0" onClick={() => handleDelete(c.id)} title="Supprimer">
                    <Trash2 size={18} />
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
