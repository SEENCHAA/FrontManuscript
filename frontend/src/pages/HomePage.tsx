import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-bootstrap';
import { type Letter } from '../types';
import { MOCK_LETTERS } from '../mockData';
import { api } from '../api';
import { getImageUrl } from '../utils/imageUrl';
import '../index.css';

const APP_BASE = import.meta.env.BASE_URL;

export const HomePage: React.FC = () => {
    const [slides, setSlides] = useState<Letter[]>([]);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const response = await api.letters.lettersList();
                const rawData = response.data;
                
                const processed: Letter[] = rawData.slice(0, 5).map((item: any) => {
                    return {
                        id: item.id || item.ID,
                        name: item.name || item.Name,
                        description: item.description || item.Description,
                        imageURL: getImageUrl(item.imageURL || item.ImageURL),
                        details: "", periodStart: 0, periodEnd: 0, isActive: true
                    };
                });
                setSlides(processed);
            } catch (e) {
                console.error(e);
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
    );
};