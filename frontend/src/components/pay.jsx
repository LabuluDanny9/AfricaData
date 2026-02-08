import { Link } from 'react-router-dom';
import './pay.css';

function Pay() {
  const handlePay = (e) => {
    e.preventDefault();
    // TODO: intégration paiement
  };

  return (
    <div className="pay">
      <div className="pay__container">
        <div className="pay__card">
          <h1 className="pay__title">Paiement</h1>
          <div className="pay__summary">
            <div className="pay__row">
              <span>Total</span>
              <span className="pay__total">0,00 €</span>
            </div>
          </div>
          <div className="pay__methods">
            <label className="pay__method pay__method--selected">
              <input type="radio" name="method" defaultChecked readOnly />
              <span>Carte bancaire</span>
            </label>
            <label className="pay__method">
              <input type="radio" name="method" />
              <span>Mobile Money</span>
            </label>
          </div>
          <button type="button" className="pay__submit" onClick={handlePay}>Payer</button>
          <p className="pay__secure">🔒 Paiement sécurisé</p>
        </div>
        <Link to="/" className="pay__back">← Retour</Link>
      </div>
    </div>
  );
}

export default Pay;
