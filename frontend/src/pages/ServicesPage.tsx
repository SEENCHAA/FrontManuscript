import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 
import { Spinner, Form, Button } from 'react-bootstrap';
import { ServiceCard } from '../components/ServiceCard';
import { CustomBreadcrumbs } from '../components/CustomBreadcrumbs';
import { type Letter } from '../types';
import { MOCK_LETTERS } from '../mockData'; 
import '../index.css';

import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../store/store';
import { setSearchTerm } from '../store/filterSlice';

const APP_BASE = import.meta.env.BASE_URL; 
const MINIO_BASE_URL = `/${'manuscripts'}/`;

const LOGO_URL = `${APP_BASE}british-museum-logo.svg`; 
const MATRYOSHKA_ACTIVE_URL = `${APP_BASE}icons8-матрешка-48.png`; 
const MATRYOSHKA_INACTIVE_URL = `${APP_BASE}icons8-matryoshka-unaktiv.png`;

export const ServicesPage: React.FC = () => {
    const dispatch = useDispatch();
    const { searchTerm } = useSelector((state: RootState) => state.filters);
    const [localInput, setLocalInput] = useState<string>(searchTerm);
    const [letters, setLetters] = useState<Letter[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isMock, setIsMock] = useState<boolean>(false);
    const [totalOrderCount, setTotalOrderCount] = useState<number>(0);

    const handleSearchClick = () => {
        dispatch(setSearchTerm(localInput));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearchClick();
    };

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
    
    const fetchLetters = async () => {
        setLoading(true);
        setIsMock(false);
        
        const params = new URLSearchParams();
        if (searchTerm) params.append('filter', searchTerm);

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
            console.error(error);
            setIsMock(true);
            
            let filteredMock = MOCK_LETTERS;
            if (searchTerm) {
                filteredMock = filteredMock.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));
            }

            setLetters(filteredMock.map(letter => ({
                ...letter,
                imageURL: `${APP_BASE}${letter.imageURL}`
            })));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLetters();
        fetchOrderCount();
    }, [searchTerm]); 

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
                </div>
            </div>

            <CustomBreadcrumbs />

            <div className="title-row">
                <h1>Список признаков</h1>
                
                <div className="title-controls">
                    <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                        <Form.Control 
                            type="text" 
                            placeholder="Название..." 
                            value={localInput}
                            onChange={(e) => setLocalInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="search-input"
                        />
                        <Button 
                            variant="warning" 
                            onClick={handleSearchClick}
                            style={{ fontWeight: 'bold' }}
                        >
                            Найти
                        </Button>
                    </div>

                    <Link to="/manuscripts/1" className={`order-link ${totalOrderCount === 0 ? 'disabled' : ''}`}>
                        <img 
                            src={totalOrderCount > 0 ? MATRYOSHKA_ACTIVE_URL : MATRYOSHKA_INACTIVE_URL} 
                            alt="Basket" 
                            className="order-icon" 
                        />
                        {totalOrderCount > 0 && <span className="order-count">{totalOrderCount}</span>}
                    </Link>
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