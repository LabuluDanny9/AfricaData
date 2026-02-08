import { Star } from 'lucide-react';
import './RatingStars.css';

/**
 * Affiche ou permet de saisir une note de 1 à 5 étoiles.
 * @param {number} value - Note moyenne (0-5)
 * @param {number} count - Nombre d'avis (optionnel)
 * @param {boolean} interactive - Si true, clic pour noter
 * @param {function} onChange - (rating: number) => void
 * @param {number} size - Taille des étoiles en px
 */
export default function RatingStars({ value = 0, count, interactive = false, onChange, size = 18 }) {
  const rounded = Math.round(value * 2) / 2; // 0, 0.5, 1, ... 5

  const handleClick = (rating) => {
    if (interactive && onChange) onChange(rating);
  };

  return (
    <div className="rating-stars d-flex align-items-center gap-1 flex-wrap">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rounded;
        const half = star - 0.5 <= rounded && rounded < star;
        return (
          <span
            key={star}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(star); } : undefined}
            onClick={interactive ? () => handleClick(star) : undefined}
            className={`rating-star ${interactive ? 'rating-star--interactive' : ''} ${filled ? 'rating-star--filled' : ''} ${half ? 'rating-star--half' : ''}`}
            style={{ width: size, height: size }}
            aria-label={interactive ? `Noter ${star} sur 5` : undefined}
          >
            <Star size={size} fill={filled ? 'currentColor' : 'none'} strokeWidth={1.5} />
          </span>
        );
      })}
      {count != null && (
        <span className="rating-stars-count small text-body-secondary ms-1">({count})</span>
      )}
    </div>
  );
}
