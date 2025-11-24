import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 
import { Spinner, Form, Row, Col } from 'react-bootstrap';
import { ServiceCard } from '../components/ServiceCard';
import { CustomBreadcrumbs } from '../components/CustomBreadcrumbs';
import { type Letter } from '../types';
import { MOCK_LETTERS } from '../mockData'; 
import '../index.css';

// --- REDUX ИМПОРТЫ ---
import { useSelector, useDispatch } from 'react-redux';
import {type RootState } from '../store/store'; // Убедитесь, что путь верный
import { setSearchTerm, setMinYear, setMaxYear } from '../store/filterSlice'; // Убедитесь, что путь верный

const MINIO_BUCKET = 'manuscripts';
const MINIO_BASE_URL = `/${MINIO_BUCKET}/`;
const LOGO_URL = MINIO_BASE_URL + 'british-museum-logo.svg';
const MATRYOSHKA_ACTIVE_URL = MINIO_BASE_URL + 'icons8-матрешка-48.png';
const MATRYOSHKA_INACTIVE_URL = MINIO_BASE_URL + 'icons8-matryoshka-unaktiv.png';

export const ServicesPage: React.FC = () => {
    // --- ПОДКЛЮЧЕНИЕ REDUX ---
    const dispatch = useDispatch();
    // Достаем значения фильтров из глобального хранилища
    const { searchTerm, minYear, maxYear } = useSelector((state: RootState) => state.filters);

    // Локальные состояния (только для данных и UI)
    const [letters, setLetters] = useState<Letter[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isMock, setIsMock] = useState<boolean>(false);
    const [totalOrderCount, setTotalOrderCount] = useState<number>(0);

    // Получение количества в корзине
    const fetchOrderCount = async () => {
        const token = localStorage.getItem('token');
        if (!token) { setTotalOrderCount(0); return; }
        try {
            const response = await fetch('/api/manuscripts/basket', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const list = data.Letters || [];
                const total = list.reduce((sum: number, item: any) => sum + (item.Quantity || 1), 0);
                setTotalOrderCount(total);
            }
        } catch (e) { console.error(e); }
    };
    
    // Загрузка писем с учетом фильтров из Redux
    const fetchLetters = async () => {
        setLoading(true);
        setIsMock(false);
        
        const params = new URLSearchParams();
        if (searchTerm) params.append('filter', searchTerm);
        if (minYear) params.append('min_year', minYear);
        if (maxYear) params.append('max_year', maxYear);

        const url = `/api/letters?${params.toString()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const rawData = await response.json();
            
            const processedLetters: Letter[] = rawData.map((item: any) => {
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
                    details: item.Details,
                    periodStart: item.PeriodStart,
                    periodEnd: item.PeriodEnd,
                    isActive: item.IsActive,
                    imageURL: img,
                };
            });
            setLetters(processedLetters);
        } catch (error) {
            console.error("Mock mode enabled:", error);
            setIsMock(true);
            
            let filteredMock = MOCK_LETTERS;
            if (searchTerm) filteredMock = filteredMock.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));
            if (minYear) filteredMock = filteredMock.filter(l => l.periodStart >= parseInt(minYear));
            if (maxYear) filteredMock = filteredMock.filter(l => l.periodEnd <= parseInt(maxYear));

            setLetters(filteredMock.map(letter => ({
                ...letter,
                imageURL: letter.imageURL.startsWith('http') ? letter.imageURL : MINIO_BASE_URL + letter.imageURL.split('/').pop()
            })));
        } finally {
            setLoading(false);
        }
    };

    // useEffect следит за переменными из Redux
    useEffect(() => {
        fetchLetters();
        fetchOrderCount();
    }, [searchTerm, minYear, maxYear]); 

    const handleAddLetterToManuscript = async (letterID: number) => {
        const token = localStorage.getItem('token');
        if (!token) { alert('Войдите в систему'); return; }
        try {
            const res = await fetch(`/api/letters/${letterID}/manuscript`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchOrderCount();
        } catch (e) { console.error(e); }
    };

    return (
        <>
            <div className="site-header">
                <div className="header-left">
                    <Link to="/">
                        <img src={LOGO_URL} alt="Логотип" className="logo" />
                    </Link>
                    <nav style={{ marginLeft: '30px', display: 'flex', gap: '20px' }}>
                        <Link to="/" style={{ color: '#fff', fontSize: '18px' }}>Главная</Link>
                        <Link to="/services" style={{ color: '#f2d70a', fontSize: '18px', textDecoration: 'underline' }}>Услуги</Link>
                    </nav>
                </div>
            </div>

            <CustomBreadcrumbs />

            <div className="title-row" style={{ display: 'block' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1>Список признаков</h1>
                     <Link to="/manuscripts/1" className={`order-link ${totalOrderCount === 0 ? 'disabled' : ''}`}>
                        <img src={totalOrderCount > 0 ? MATRYOSHKA_ACTIVE_URL : MATRYOSHKA_INACTIVE_URL} alt="Basket" className="order-icon" />
                        {totalOrderCount > 0 && <span className="order-count">{totalOrderCount}</span>}
                    </Link>
                </div>

                <div style={{ background: '#1D1D1D', padding: '20px', borderRadius: '8px' }}>
                    <Row>
                        <Col md={4}>
                            <Form.Control 
                                type="text" 
                                placeholder="Поиск по названию..." 
                                value={searchTerm}
                                // ВАЖНО: Отправляем Action в Redux
                                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                                style={{ background: '#333', color: '#fff', border: 'none' }}
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Control 
                                type="number" 
                                placeholder="Год от" 
                                value={minYear}
                                onChange={(e) => dispatch(setMinYear(e.target.value))}
                                style={{ background: '#333', color: '#fff', border: 'none' }}
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Control 
                                type="number" 
                                placeholder="Год до" 
                                value={maxYear}
                                onChange={(e) => dispatch(setMaxYear(e.target.value))}
                                style={{ background: '#333', color: '#fff', border: 'none' }}
                            />
                        </Col>
                        <Col md={2} style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ color: '#B6BCBF', fontSize: '14px' }}>Найдено: {letters.length}</span>
                        </Col>
                    </Row>
                </div>
            </div>

            {isMock && <div style={{ textAlign: 'center', color: '#f2d70a', margin: '10px' }}>⚠️ Mock-режим</div>}
            
            <div className="grid">
                {loading ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#fff' }}><Spinner animation="border" /></div>
                ) : (
                    letters.map((letter) => (
                        <ServiceCard key={letter.id} letter={letter} onAdd={handleAddLetterToManuscript} />
                    ))
                )}
                {letters.length === 0 && !loading && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#B6BCBF' }}>Ничего не найдено</p>}
            </div>
        </>
    );
};