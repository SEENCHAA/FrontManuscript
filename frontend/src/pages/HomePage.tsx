import React, { useEffect, useState } from 'react';
import { Carousel, Nav, Navbar, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { type Letter } from '../types';
import { MOCK_LETTERS } from '../mockData';
import '../index.css';

const APP_BASE = import.meta.env.BASE_URL;
const MINIO_BUCKET = 'manuscripts';
const MINIO_BASE_URL = `/${MINIO_BUCKET}/`;
const LOGO_URL = `${APP_BASE}british-museum-logo.svg`;

export const HomePage: React.FC = () => {
    const [slides, setSlides] = useState<Letter[]>([]);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const response = await fetch('/api/letters');
                if (response.ok) {
                    const rawData = await response.json();
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
                            details: "", periodStart: 0, periodEnd: 0, isActive: true
                        };
                    });
                    setSlides(processed);
                } else {
                    throw new Error("Failed to load");
                }
            } catch (e) {
                console.error("Using mocks for slides");
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
                style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000, padding: '0 35px' }}
            >
                <Container fluid>
                    <Navbar.Brand as={Link} to="/">
                        <img src={LOGO_URL} alt="Логотип" className="logo" />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                        <Nav>
                            <NavDropdown 
                                title={<span style={{ color: '#fff', fontSize: '18px' }}>Меню</span>} 
                                id="basic-nav-dropdown" 
                                menuVariant="dark" 
                                align="end"
                            >
                                <NavDropdown.Item as={Link} to="/services">Список услуг</NavDropdown.Item>
                                <NavDropdown.Divider />
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Убрали inline styles, теперь всё управляется классом .home-container */}
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