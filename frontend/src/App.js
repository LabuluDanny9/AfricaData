import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Accueil from './components/accueil';
import About from './components/about';
import Connexion from './components/connexion';
import Inscription from './components/inscription';
import ForgotPassword from './components/forgotPassword';
import Librairie from './components/librairie';
import PublicationDetails from './components/publicationDetails';
import Pay from './components/pay';

import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';
import DashboardUser from './components/user/DashboardUser';
import MesPublications from './components/user/MesPublications';
import Favoris from './components/user/Favoris';
import AvisCommentaires from './components/user/AvisCommentaires';
import Profil from './components/user/Profil';
import SubmitWizard from './components/user/SubmitWizard';
import NormesPublication from './components/user/NormesPublication';
import SuperAdmin from './components/admin/SuperAdmin';
import AdminPublications from './components/admin/AdminPublications';
import AdminUsers from './components/admin/AdminUsers';
import AdminPayments from './components/admin/AdminPayments';
import AdminLibrary from './components/admin/AdminLibrary';
import AdminComments from './components/admin/AdminComments';
import AdminNotifications from './components/admin/AdminNotifications';
import AdminStatistics from './components/admin/AdminStatistics';
import AdminSettings from './components/admin/AdminSettings';
import AdminAudit from './components/admin/AdminAudit';
import AdminWaiverCodes from './components/admin/AdminWaiverCodes';

function App() {
  return (
    <div className="app-platform">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/about" element={<About />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/connexion-admin" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
          <Route path="/publication/:id" element={<PublicationDetails />} />
          <Route path="/pay" element={<Pay />} />

          {/* Interface utilisateur (navbar + sidebar) — réservée aux utilisateurs connectés */}
          <Route element={<UserLayout />}>
            <Route path="dashboard" element={<DashboardUser />} />
            <Route path="librairie" element={<Librairie embedded />} />
            <Route path="submit" element={<SubmitWizard />} />
            <Route path="normes-de-publication" element={<NormesPublication />} />
            <Route path="mes-publications" element={<MesPublications />} />
            <Route path="favoris" element={<Favoris />} />
            <Route path="avis" element={<AvisCommentaires />} />
            <Route path="profil" element={<Profil />} />
          </Route>

          {/* Interface Admin — réservée aux rôles admin (Super Admin, Admin éditorial, Modérateur) */}
          <Route path="superadmin" element={<AdminLayout />}>
            <Route index element={<SuperAdmin />} />
            <Route path="publications" element={<AdminPublications />} />
            <Route path="utilisateurs" element={<AdminUsers />} />
            <Route path="paiements" element={<AdminPayments />} />
            <Route path="codes-publication" element={<AdminWaiverCodes />} />
            <Route path="bibliotheque" element={<AdminLibrary />} />
            <Route path="commentaires" element={<AdminComments />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="statistiques" element={<AdminStatistics />} />
            <Route path="parametres" element={<AdminSettings />} />
            <Route path="audit" element={<AdminAudit />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
