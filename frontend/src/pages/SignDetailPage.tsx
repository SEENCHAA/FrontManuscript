import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { type Letter } from '../types';
import { CustomBreadcrumbs } from '../components/CustomBreadcrumbs';
import { MOCK_LETTERS } from '../mockData';
import { API_URL, MINIO_URL } from '../config';
import '../index.css';

const APP_BASE = import.meta.env.BASE_URL;
const LOGO_URL = `${APP_BASE}british-museum-logo.svg`;
const PLACEHOLDER_URL = `${APP_BASE}placeholder.jpg`; 

export const SignDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [letter, setLetter] = useState<Letter | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLetterDetail = async () => {
            setLoading(true);
            setError(null);
            const url = `${API_URL}/letters/${id}`;

            try {
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const rawData = await response.json();
                
                let img = rawData.ImageURL || "";
                if (img.includes('/manuscripts/')) {
                    const parts = img.split('/manuscripts/');
                    if (parts.length > 1) {
                        img = `${MINIO_URL}/${parts[1]}`;
                    }
                } else if (!img.startsWith('http')) {
                    img = `${MINIO_URL}/${img.replace(/^\//, '')}`;
                }

                const processedLetter: Letter = {
                    id: rawData.ID,
                    name: rawData.Name,
                    description: rawData.Description,
                    details: rawData.Details,
                    periodStart: rawData.PeriodStart,
                    periodEnd: rawData.PeriodEnd,
                    isActive: rawData.IsActive,
                    imageURL: img
                };
                setLetter(processedLetter);

            } catch (err) {
                console.error(err);
                if (id) {
                    const mock = MOCK_LETTERS.find(l => l.id === Number(id));
                    if (mock) {
                        setLetter({
                            ...mock,
                            imageURL: `${APP_BASE}${mock.imageURL}`
                        });
                    } else {
                        setError('Буква не найдена.');
                    }
                }
            } finally {
                setLoading(false);
            }
        };
        fetchLetterDetail();
    }, [id]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '150px', color: '#fff' }}>Загрузка...</div>;
    if (error) return <div style={{ textAlign: 'center', color: 'red', marginTop: '150px' }}>{error}</div>;
    if (!letter) return null;

    return (
        <div>
            <div className="site-header">
                <div className="header-left">
                    <Link to="/services">
                        <img src={LOGO_URL} alt="Логотип" className="logo" />
                    </Link>
                </div>
            </div>

            <CustomBreadcrumbs lastItemTitle={letter.name} />

            <div className="title-row center">
                <h1 style={{ color: '#fff' }}>{letter.name}</h1>
                <div className="title-controls">
                </div>
            </div>

            <div className="detail-container">
                <div className="detail-left">
                    <img 
                        src={letter.imageURL || PLACEHOLDER_URL} 
                        alt={letter.name} 
                        className="detail-image" 
                    />
                </div>
                <div className="detail-right">
                    <p className="detail-text">{letter.details}</p>
                    <p className="detail-text">
                        <b>Период использования:</b> {letter.periodStart} — {letter.periodEnd} гг.
                    </p>
                </div>
            </div>
        </div>
    );
};