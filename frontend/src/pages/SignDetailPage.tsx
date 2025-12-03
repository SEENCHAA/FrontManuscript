import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { type Letter } from '../types';
import { CustomBreadcrumbs } from '../components/CustomBreadcrumbs';
import { MOCK_LETTERS } from '../mockData';
import { api } from '../api';
import { getImageUrl } from '../utils/imageUrl';
import '../index.css';

const APP_BASE = import.meta.env.BASE_URL;


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

            try {
                const response = await api.letters.lettersDetail(Number(id));
                const rawData = response.data;
                
                const processedLetter: Letter = {
                    id: rawData.id || 0,
                    name: rawData.name || "Без названия",
                    description: rawData.description || "",
                    details: rawData.details || "",
                    periodStart: rawData.period_start || 0,
                    periodEnd: rawData.period_end || 0,
                    isActive: rawData.is_active || false,
                    // @ts-ignore
                    imageURL: getImageUrl(rawData.imageURL || rawData.imageUrl || rawData.image_url)
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

            <CustomBreadcrumbs lastItemTitle={letter.name} />

            <div className="title-row center">
                <h1 style={{ color: '#fff' }}>{letter.name}</h1>
                {/* Кнопка "Назад" осталась, но теперь она просто картинка-ссылка в заголовке */}
                <div className="title-controls" style={{ minWidth: 'auto' }}>
                    
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