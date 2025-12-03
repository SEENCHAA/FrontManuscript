import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { SignDetailPage } from './pages/SignDetailPage'; 
import { ManuscriptPage } from './pages/ManuscriptPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { ProfilePage } from './pages/ProfilePage';
import { Header } from './components/Header';
import './index.css' 

function App() {

    return (
        <Router basename={import.meta.env.BASE_URL}>
            <Header />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/manuscripts/:id" element={<ManuscriptPage />} />
                <Route path="/sign/:id" element={<SignDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/orders" element={<MyOrdersPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Routes>
        </Router>
    );
}

export default App;