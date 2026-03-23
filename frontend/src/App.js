import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Accueil from './components/accueil';
import About from './components/about';
import Connexion from './components/connexion';
import Inscription from './components/inscription';
import ForgotPassword from './components/forgotPassword';
import Dashboard from './components/dashboard';
import Librairie from './components/librairie';
import PublicationDetails from './components/publicationDetails';
import Submit from './components/submit';
import Pay from './components/pay';

function App() {
  return (
    <div className="app-platform">
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/about" element={<About />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/librairie" element={<Librairie />} />
        <Route path="/publication/:id" element={<PublicationDetails />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/pay" element={<Pay />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
