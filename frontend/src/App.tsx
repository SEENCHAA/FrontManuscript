import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { SignDetailPage } from './pages/SignDetailPage'; 
import { ManuscriptPage } from './pages/ManuscriptPage'; 
import './index.css' 

function App() {
    return (
        <Router basename={import.meta.env.BASE_URL}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/sign/:id" element={<SignDetailPage />} />
                <Route path="/manuscripts/:id" element={<ManuscriptPage />} />
                
                {/* Заглушки */}
                <Route path="/login" element={<div style={{marginTop: 200, textAlign: 'center', color: 'white'}}>Login</div>} />
                <Route path="/register" element={<div style={{marginTop: 200, textAlign: 'center', color: 'white'}}>Register</div>} />
            </Routes>
        </Router>
    );
}

export default App;