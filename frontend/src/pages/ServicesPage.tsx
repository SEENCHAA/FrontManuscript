import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 
import { Spinner, Form, Button } from 'react-bootstrap';
import { ServiceCard } from '../components/ServiceCard';
import { CustomBreadcrumbs } from '../components/CustomBreadcrumbs';
import { type Letter } from '../types';
import { MOCK_LETTERS } from '../mockData'; 
import '../index.css';

import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '../store/store';
import { setSearchTerm } from '../store/filterSlice';
import { addLetterToManuscript, fetchDraft } from '../store/manuscriptSlice';
import {  MINIO_URL } from '../config';
import { api } from '../api';

const APP_BASE = import.meta.env.BASE_URL;
const MATRYOSHKA_ACTIVE_URL = `${APP_BASE}icons8-матрешка-48.png`;
const MATRYOSHKA_INACTIVE_URL = `${APP_BASE}icons8-matryoshka-unaktiv.png`;

export const ServicesPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { searchTerm } = useSelector((state: RootState) => state.filters);
    const { isAuth } = useSelector((state: RootState) => state.auth);

    const { app_id, count } = useSelector((state: RootState) => state.manuscripts);

    const [localInput, setLocalInput] = useState<string>(searchTerm);
    const [letters, setLetters] = useState<Letter[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isMock, setIsMock] = useState<boolean>(false);


    useEffect(() => {
        if(isAuth) {
            dispatch(fetchDraft());
        }
    }, [isAuth, dispatch]);

    const handleSearchClick = () => {
        dispatch(setSearchTerm(localInput));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearchClick();
    };
    
    const fetchLetters = async () => {
        setLoading(true);
        setIsMock(false);

        try {
            const response = await api.letters.lettersList({ filter: searchTerm });
            const rawData = response.data;
            
            const processedLetters: Letter[] = rawData.map((item: any) => {
                let rawImg = item.image_url || item.ImageURL || ""; 
                let img = rawImg;

                if (rawImg.includes('/manuscripts/')) {
                    const parts = rawImg.split('/manuscripts/');
                    if (parts.length > 1) img = `${MINIO_URL}/${parts[1]}`;
                } else if (rawImg && !rawImg.startsWith('http')) {
                    img = `${MINIO_URL}/${rawImg.replace(/^\//, '')}`;
                }

                return {
                    id: item.id || item.ID,
                    name: item.name || item.Name,
                    description: item.description || item.Description,
                    details: item.details || item.Details,
                    periodStart: item.periodStart || item.PeriodStart,
                    periodEnd: item.periodEnd || item.PeriodEnd,
                    isActive: item.isActive || item.IsActive,
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
    }, [searchTerm]); 

    const handleAddLetterToManuscript = async (letterID: number) => {
        if (!isAuth) return;
        dispatch(addLetterToManuscript(letterID));
    };

    return (
        <>
            <CustomBreadcrumbs />

            <div className="title-row">
                <h1>Список признаков</h1>
                <div className="title-controls">
                    <div className="search-block" style={{ display: 'flex', gap: '10px', flex: 1 }}>
                        <Form.Control 
                            type="text" 
                            placeholder="Название..." 
                            value={localInput}
                            onChange={(e) => setLocalInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="search-input"
                        />
                        <Button variant="warning" onClick={handleSearchClick} style={{ fontWeight: 'bold' }}>Найти</Button>
                    </div>
                    
                    <Link to={app_id ? `/manuscripts/${app_id}` : '#'} className={`order-link ${!app_id ? 'disabled' : ''}`}>
                        <img 
                            src={app_id ? MATRYOSHKA_ACTIVE_URL : MATRYOSHKA_INACTIVE_URL} 
                            alt="Basket" 
                            className="order-icon" 
                        />
                        {app_id && count > 0 && <span className="order-count">{count}</span>}
                    </Link>
                </div>
            </div>

            {isMock && <div style={{ textAlign: 'center', color: '#f2d70a', margin: '10px' }}>⚠️ Mock-режим</div>}
            
            <div className="grid">
                {loading ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#fff' }}><Spinner animation="border" /></div>
                ) : (
                    letters.map((letter) => (
                        <ServiceCard 
                            key={letter.id} 
                            letter={letter} 
                            onAdd={handleAddLetterToManuscript}
                            isAuth={isAuth} 
                        />
                    ))
                )}
                {letters.length === 0 && !loading && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#B6BCBF' }}>Ничего не найдено</p>}
            </div>
        </>
    );
};