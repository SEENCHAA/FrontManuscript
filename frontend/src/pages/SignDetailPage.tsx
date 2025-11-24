import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { type Letter } from '../types';
import { CustomBreadcrumbs } from '../components/CustomBreadcrumbs';
import { MOCK_LETTERS } from '../mockData';
import '../index.css';

const MINIO_BUCKET = 'manuscripts';
const MINIO_BASE_URL = `/${MINIO_BUCKET}/`;

const LOGO_URL = MINIO_BASE_URL + 'british-museum-logo.svg';

const PLACEHOLDER_URL = MINIO_BASE_URL + 'placeholder.jpg'; 

export const SignDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [letter, setLetter] = useState<Letter | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLetterDetail = async () => {
            setLoading(true);
            setError(null);
            
            // Запрос к API
            const url = `/api/letters/${id}`;

            try {
                const response = await fetch(url);
                
                if (response.status === 404) {
                    setError('Буква не найдена.');
                    return;
                }
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // 1. Получаем "сырые" данные с Большими буквами (Go style)
                const rawData = await response.json();

                // 2. Обрабатываем картинку (убираем прямой адрес MinIO, чтобы работал Прокси)
                let img = rawData.ImageURL || "";
                if (img.includes('127.0.0.1:9000')) {
                    img = img.replace('http://127.0.0.1:9000', '');
                } else if (!img.startsWith('/') && !img.startsWith('http')) {
                     // Если путь пришел относительный без слэша
                     img = MINIO_BASE_URL + img;
                }

                // 3. Преобразуем (Маппинг) в формат фронтенда
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
                console.error("Ошибка загрузки детальной страницы:", err);
                
                // Fallback на Mock-данные, если бекенд упал
                if (id) {
                    const mock = MOCK_LETTERS.find(l => l.id === Number(id));
                    if (mock) {
                        setLetter({
                            ...mock,
                            imageURL: mock.imageURL.startsWith('http') ? mock.imageURL : MINIO_BASE_URL + mock.imageURL
                        });
                    } else {
                        setError('Не удалось загрузить данные (и в моках нет).');
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLetterDetail();
    }, [id]);

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '150px', color: '#fff' }}>Загрузка...</div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', color: 'red', marginTop: '150px' }}>{error}</div>;
    }

    if (!letter) {
        return <div style={{ textAlign: 'center', color: '#fff', marginTop: '150px' }}>Данные не найдены</div>;
    }

    return (
        <div>
            {/* Хедер */}
            <div className="site-header">
                <div className="header-left">
                    <Link to="/services">
                        <img src={LOGO_URL} alt="Логотип" className="logo" />
                    </Link>
                </div>
            </div>

            {/* Хлебные крошки */}
            <CustomBreadcrumbs lastItemTitle={letter.name} />

            {/* Заголовок по центру + кнопка назад */}
            <div className="title-row center">
                <h1 style={{ color: '#fff' }}>{letter.name}</h1>
                <div className="title-controls">

                </div>
            </div>

            {/* Контент */}
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