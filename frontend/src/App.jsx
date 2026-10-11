import { useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { AppProvider } from './context/AppContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Footer from './components/Footer.jsx';
import { EmptyState } from './components/ui.jsx';
import Home from './pages/Home.jsx';
import ProfileForm from './pages/ProfileForm.jsx';
import Results from './pages/Results.jsx';
import CareerDetail from './pages/CareerDetail.jsx';
import SkillGap from './pages/SkillGap.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="page max-w-lg">
      <EmptyState icon={SearchX} title="Page not found" text="This page doesn't exist."
        action={<Link to="/" className="btn-primary">Go home</Link>} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/skill-gap" element={<SkillGap />} />
              <Route path="/explore" element={<ProfileForm />} />
              <Route path="/results" element={<Results />} />
              <Route path="/career/:name" element={<CareerDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AppProvider>
    </AuthProvider>
  );
}
