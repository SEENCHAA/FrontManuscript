// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';           // <--- Добавляем импорт Главной
import { ServicesPage } from './pages/ServicesPage'; 
import { SignDetailPage } from './pages/SignDetailPage'; 
import { ManuscriptPage } from './pages/ManuscriptPage'; 
import './index.css' 

function App() {
    return (
        <Router>
            <Routes>
                {/* Главная страница (без карточек, с инфой и входом) */}
                <Route path="/" element={<HomePage />} />

                {/* Страница с карточками (Услуги) */}
                <Route path="/services" element={<ServicesPage />} />
                
                {/* Детальная страница */}
                <Route path="/sign/:id" element={<SignDetailPage />} />
                
                {/* Корзина */}
                <Route path="/manuscripts/:id" element={<ManuscriptPage />} />
                
                {/* Заглушки для логина/регистрации (пока можно просто перенаправлять на главную или сделать пустые компоненты) */}
                <Route path="/login" element={<div style={{textAlign:'center', color:'white', marginTop:'150px'}}>Страница входа (в разработке)</div>} />
                <Route path="/register" element={<div style={{textAlign:'center', color:'white', marginTop:'150px'}}>Страница регистрации (в разработке)</div>} />
            </Routes>
        </Router>
    );
}

export default App;