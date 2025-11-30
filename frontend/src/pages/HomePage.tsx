import React, { useEffect, useState } from 'react';
import { Carousel, Nav, Navbar, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { type Letter } from '../types';
import { MOCK_LETTERS } from '../mockData';
import '../index.css';

// ИМПОРТИРУЕМ НАШ ХАРДКОРНЫЙ URL
import { API_URL, MINIO_URL } from '../config';

const APP_BASE = import.meta.env.BASE_URL;
const LOGO_URL = `${APP_BASE}british-museum-logo.svg`;

export const HomePage: React.FC = () => {
    const [slides, setSlides] = useState<Letter[]>([]);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                // ВАЖНО: Используем API_URL, а не просто '/api'
                console.log("Fetching slides from:", `${API_URL}/letters`);
                
                const response = await fetch(`${API_URL}/letters`);
                
                if (response.ok) {
                    const rawData = await response.json();
                    const processed: Letter[] = rawData.slice(0, 5).map((item: any) => {
                        let img = item.ImageURL || "";
                        
                        // Обработка картинок через MINIO_URL
                        if (img.includes('/manuscripts/')) {
                            const parts = img.split('/manuscripts/');
                            if (parts.length > 1) {
                                img = `${MINIO_URL}/${parts[1]}`;
                            }
                        } else if (!img.startsWith('http')) {
                            img = `${MINIO_URL}/${img.replace(/^\//, '')}`;
                        }
                        
                        return {
                            id: item.ID,
                            name: item.Name,
                            description: item.Description,
                            imageURL: img,
                            details: "", periodStart: 0, periodEnd: 0, isActive: true
                        };
                    });
                    setSlides(processed);
                } else {
                    throw new Error("Failed to load");
                }
            } catch (e) {
                console.error("Using mocks for slides. Error:", e);
                const mockSlides = MOCK_LETTERS.slice(0, 5).map(l => ({
                    ...l,
                    imageURL: `${APP_BASE}${l.imageURL}`
                }));
                setSlides(mockSlides);
            }
        };
        fetchSlides();
    }, []);

    return (
        <>
            <Navbar 
                variant="dark" 
                expand="lg" 
                className="site-header" 
                collapseOnSelect
                style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000, padding: '0 35px' }}
            >
                <Container fluid>
                    <Navbar.Brand as={Link} to="/">
                        <img src={LOGO_URL} alt="Логотип" className="logo" />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" style={{ border: 'none' }} />
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                        <Nav className="align-items-center">
                            
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

            <div className="home-container">
                <h1 style={{ fontSize: '42px', color: '#fff', marginBottom: '20px' }}>
                    Анализ древнерусских рукописей
                </h1>
                
                <p style={{ fontSize: '18px', color: '#B6BCBF', lineHeight: '1.6', marginBottom: '30px' }}>
                    Наш сервис помогает исследователям и историкам определять временной период написания документов 
                    на основе палеографического анализа начертания букв.
                </p>

                <h3 style={{ color: '#f2d70a', marginBottom: '20px' }}>Примеры признаков</h3>
                
                {slides.length > 0 ? (
                    <Carousel className="carousel-container">
                        {slides.map(slide => (
                            <Carousel.Item key={slide.id}>
                                <div className="carousel-image-wrapper">
                                    <img
                                        className="d-block"
                                        src={slide.imageURL}
                                        alt={slide.name}
                                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                    />
                                </div>
                                <Carousel.Caption style={{ background: 'rgba(0,0,0,0.8)', borderRadius: '10px' }}>
                                    <h3>{slide.name}</h3>
                                    <p>{slide.description}</p>
                                </Carousel.Caption>
                            </Carousel.Item>
                        ))}
                    </Carousel>
                ) : (
                    <p style={{color: '#B6BCBF'}}>Загрузка примеров...</p>
                )}
            </div>
        </>
    );
};