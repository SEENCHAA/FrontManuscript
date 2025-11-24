import React, { useEffect, useState } from 'react';
import { Carousel, Nav, Navbar, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { type Letter } from '../types';
import '../index.css';

const MINIO_BUCKET = 'manuscripts';
const MINIO_BASE_URL = `/${MINIO_BUCKET}/`;
const LOGO_URL = MINIO_BASE_URL + 'british-museum-logo.svg';

export const HomePage: React.FC = () => {
    const [slides, setSlides] = useState<Letter[]>([]);

    // Загружаем данные для карусели (берем первые 5 букв)
    useEffect(() => {
        const fetchSlides = async () => {
            try {
                // Запрашиваем список без фильтров
                const response = await fetch('/api/letters');
                if (response.ok) {
                    const rawData = await response.json();
                    
                    // Маппим данные (как делали в ServicesPage)
                    const processed: Letter[] = rawData.slice(0, 5).map((item: any) => {
                        let img = item.ImageURL || "";
                        if (img.includes('127.0.0.1:9000')) {
                            img = img.replace('http://127.0.0.1:9000', '');
                        } else if (!img.startsWith('/') && !img.startsWith('http')) {
                            img = MINIO_BASE_URL + img;
                        }
                        return {
                            id: item.ID,
                            name: item.Name,
                            description: item.Description,
                            imageURL: img,
                            // остальные поля не важны для слайдера
                            details: "", periodStart: 0, periodEnd: 0, isActive: true
                        };
                    });
                    setSlides(processed);
                }
            } catch (e) {
                console.error("Ошибка загрузки слайдов", e);
            }
        };
        fetchSlides();
    }, []);

    return (
        <>
            {/* Хедер с выпадающим меню */}
            <Navbar className="site-header" variant="dark" expand="lg" style={{position: 'fixed', top: 0, width: '100%', zIndex: 1000}}>
                <Container fluid>
                    <Navbar.Brand as={Link} to="/">
                        <img src={LOGO_URL} alt="Логотип" className="logo" />
                    </Navbar.Brand>
                    
                    {/* Кнопка "бургер" для мобильных */}
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                        <Nav>
                            {/* Выпадающее меню */}
                            <NavDropdown title="Меню" id="basic-nav-dropdown" menuVariant="dark" align="end">
                                <NavDropdown.Item as={Link} to="/services">Список услуг</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item as={Link} to="/login">Вход</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/register">Регистрация</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Контент главной страницы */}
            <div className="home-container" style={{ 
                maxWidth: '1000px', 
                margin: '140px auto 50px', // Отступ сверху, так как хедер фиксирован
                textAlign: 'center', 
                padding: '20px' 
            }}>
                <h1 style={{ fontSize: '48px', color: '#fff', marginBottom: '30px' }}>
                    Анализ древнерусских рукописей
                </h1>
                
                <p style={{ fontSize: '20px', color: '#B6BCBF', lineHeight: '1.6', marginBottom: '40px' }}>
                    Наш сервис помогает исследователям определять временной период написания документов.
                    Ниже представлены примеры анализируемых признаков.
                </p>

                {/* Карусель (Слайдер) */}
                {slides.length > 0 ? (
                    <Carousel style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {slides.map(slide => (
                            <Carousel.Item key={slide.id}>
                                <div style={{ height: '400px', background: '#1D1D1D', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                                    <img
                                        className="d-block"
                                        src={slide.imageURL}
                                        alt={slide.name}
                                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                    />
                                </div>
                                <Carousel.Caption style={{ background: 'rgba(0,0,0,0.7)', borderRadius: '8px' }}>
                                    <h3>{slide.name}</h3>
                                    <p>{slide.description}</p>
                                </Carousel.Caption>
                            </Carousel.Item>
                        ))}
                    </Carousel>
                ) : (
                    <p style={{color: '#fff'}}>Загрузка примеров...</p>
                )}
            </div>
        </>
    );
};