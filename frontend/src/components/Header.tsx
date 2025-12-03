import React, { useState } from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '../store/store';
import { logout } from '../store/authSlice';
import { resetFilters } from '../store/filterSlice';
import { clearManuscriptState } from '../store/manuscriptSlice';

const APP_BASE = import.meta.env.BASE_URL;
const LOGO_URL = `${APP_BASE}british-museum-logo.svg`;

export const Header: React.FC = () => {
    const { isAuth, user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    
    const [expanded, setExpanded] = useState(false);

    const closeNav = () => setExpanded(false);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(resetFilters());
        dispatch(clearManuscriptState());
        closeNav();
        navigate('/');
    };

    
    const menuTitle = isAuth ? (user?.login || user?.login || 'Пользователь') : 'Меню';

    return (
        <Navbar 
            variant="dark" 
            
            expand="lg" 
            className="site-header" 
            expanded={expanded}
        >
            <Container fluid>
                {/* Логотип */}
                <Navbar.Brand onClick={() => { navigate(-1); closeNav(); }} style={{ cursor: 'pointer' }}>
                    <img src={LOGO_URL} alt="Логотип" className="logo" />
                </Navbar.Brand>

                {/* Кнопка-тоггл (Видна ТОЛЬКО на мобильных) */}
                <Navbar.Toggle 
                    aria-controls="main-navbar-nav" 
                    className="text-toggle"
                    onClick={() => setExpanded(!expanded)}
                >
                    <span className="menu-toggle-text">{menuTitle} ▼</span>
                </Navbar.Toggle>

                {/* Содержимое меню */}
                <Navbar.Collapse id="main-navbar-nav">
                    <Nav className="ms-auto custom-nav">
                        <Nav.Link as={Link} to="/services" className="nav-item-link" onClick={closeNav}>
                            Услуги
                        </Nav.Link>

                        {isAuth ? (
                            <>
                                {/* На ПК показываем логин просто текстом, не ссылкой */}
                                <span className="nav-username d-none d-lg-block">
                                    {user?.login || user?.login}
                                </span>

                                <Nav.Link as={Link} to="/profile" className="nav-item-link" onClick={closeNav}>
                                    Профиль
                                </Nav.Link>
                                <Nav.Link as={Link} to="/orders" className="nav-item-link" onClick={closeNav}>
                                    Мои заявки
                                </Nav.Link>
                                
                                <div className="nav-divider-hor d-none d-lg-block"></div>
                                
                                <Nav.Link onClick={handleLogout} className="nav-item-link logout-link">
                                    Выход
                                </Nav.Link>
                            </>
                        ) : (
                            <>
                                <div className="nav-divider-hor d-none d-lg-block"></div>
                                <Nav.Link as={Link} to="/login" className="nav-item-link" onClick={closeNav}>
                                    Вход
                                </Nav.Link>
                                <Nav.Link as={Link} to="/register" className="nav-item-link" onClick={closeNav}>
                                    Регистрация
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};