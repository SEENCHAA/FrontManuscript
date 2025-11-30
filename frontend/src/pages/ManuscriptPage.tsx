import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CustomBreadcrumbs } from '../components/CustomBreadcrumbs';
// ИМПОРТИРУЕМ КОНФИГ
import { API_URL, MINIO_URL } from '../config'; 
import '../index.css';

// Используем MINIO_URL для картинок

const APP_BASE = import.meta.env.BASE_URL;
const LOGO_URL = `${APP_BASE}british-museum-logo.svg`;
const DELETE_ICON_URL = `${APP_BASE}icons8-мусорка-50.png`; // Локальная иконка

interface LetterItem {
    letterID: number;
    name: string;
    description: string;
    imageURL: string;
    quantity: number;
}

interface ManuscriptData {
    id: number;
    calculatedPeriod: string | null;
    letters: LetterItem[];
}

export const ManuscriptPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); 
    const currentId = id ? parseInt(id) : 1;

    const [manuscript, setManuscript] = useState<ManuscriptData>({
        id: currentId,
        calculatedPeriod: null,
        letters: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchManuscript = async () => {
            const token = localStorage.getItem('token');
            // Если токена нет - корзину не получить
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // ИСПРАВЛЕНО: API_URL
                const response = await fetch(`${API_URL}/manuscripts/${currentId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    const processedLetters = (data.letters || []).map((l: any) => {
                        // Логика картинок как везде
                        let img = l.imageURL || l.Letter?.ImageURL || ""; 
                        // (Учитываем структуру ответа бека, иногда там вложенный Letter)
                        
                        if (img.includes('/manuscripts/')) {
                            const parts = img.split('/manuscripts/');
                            if (parts.length > 1) {
                                img = `${MINIO_URL}/${parts[1]}`;
                            }
                        } else if (!img.startsWith('http')) {
                            img = `${MINIO_URL}/${img.replace(/^\//, '')}`;
                        }

                        return {
                            ...l,
                            letterID: l.Letter?.ID || l.letterID,
                            name: l.Letter?.Name || l.name,
                            description: l.Letter?.Description || l.description,
                            imageURL: img,
                            quantity: l.Quantity || l.quantity
                        };
                    });
                    
                    setManuscript({
                        id: data.ManuscriptID || data.id,
                        calculatedPeriod: data.Manuscript?.CalculatedPeriod || data.calculatedPeriod || null,
                        letters: processedLetters
                    });
                }
            } catch (error) {
                console.error("Ошибка загрузки рукописи:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchManuscript();
    }, [currentId]);

    const handleDeleteManuscript = async () => {
        if(!window.confirm("Вы уверены, что хотите удалить заявку?")) return;
        const token = localStorage.getItem('token');
        try {
            // ИСПРАВЛЕНО: API_URL
            await fetch(`${API_URL}/manuscripts/${manuscript.id}`, { 
                method: 'DELETE', // Или POST, как у тебя в беке
                headers: { 'Authorization': `Bearer ${token}` }
            });
            navigate('/services');
        } catch (error) {
            console.error("Ошибка сети:", error);
        }
    };

    const handleUpdateQuantity = async (letterID: number, newQty: number) => {
        if (newQty < 1) return;
        const token = localStorage.getItem('token');
        try {
            // ИСПРАВЛЕНО: API_URL
            const response = await fetch(`${API_URL}/manuscripts/${manuscript.id}/letters/${letterID}`, {
                method: 'PUT', // Или POST, проверь handler.go (там PUT: /:id/letters/:lid)
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: newQty }),
            });

            if (response.ok) {
                setManuscript(prev => ({
                    ...prev,
                    letters: prev.letters.map(l => 
                        l.letterID === letterID ? { ...l, quantity: newQty } : l
                    )
                }));
            }
        } catch (error) {
            console.error("Не удалось обновить количество:", error);
        }
    };

    const handleRemoveLetter = async (letterID: number) => {
        const token = localStorage.getItem('token');
        try {
            // ИСПРАВЛЕНО: API_URL
            const response = await fetch(`${API_URL}/manuscripts/${manuscript.id}/letters/${letterID}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setManuscript(prev => ({
                    ...prev,
                    letters: prev.letters.filter(l => l.letterID !== letterID)
                }));
            }
        } catch (error) {
            console.error("Ошибка при удалении буквы:", error);
        }
    };

    if (loading) return <div style={{textAlign: 'center', color: '#fff', marginTop: '150px'}}>Загрузка...</div>;

    return (
        <>
            <div className="site-header">
                <div className="header-left">
                    <Link to="/services">
                        <img src={LOGO_URL} alt="Логотип" className="logo" />
                    </Link>
                </div>
            </div>
            
            <CustomBreadcrumbs />

            <div className="title-row">
                <h1>Ваша рукопись</h1>
            </div>

            <div className="order-container">
                <div className="order-period">
                    <h3>Возможный период написания:</h3>
                    {manuscript.calculatedPeriod ? (
                         <p className="order-period-value"><strong>{manuscript.calculatedPeriod}</strong></p>
                    ) : (
                        <p className="order-period-value"><em>Необходимо посчитать</em></p>
                    )}
                </div>

                {manuscript.letters && manuscript.letters.length > 0 ? (
                    manuscript.letters.map((item) => (
                        <div key={item.letterID} className="order-card">
                            <div className="order-info">
                                <img src={item.imageURL} alt={item.name} />
                                <div className="order-text">
                                    <h3>{item.name}</h3>
                                    <p>{item.description}</p>
                                </div>
                            </div>
                            
                            <div className="count-form">
                                <input 
                                    type="number" 
                                    className="count-input" 
                                    value={item.quantity} 
                                    min="1" 
                                    onChange={(e) => handleUpdateQuantity(item.letterID, parseInt(e.target.value))}
                                />
                                <button className="update-btn" onClick={() => handleUpdateQuantity(item.letterID, item.quantity)}>
                                    Обновить
                                </button>
                                <button className="delete-btn" onClick={() => handleRemoveLetter(item.letterID)}>
                                    <img src={DELETE_ICON_URL} alt="Удалить" className="delete-icon" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="order-empty">
                        Корзина пуста
                    </div>
                )}
            </div>

            <div className="order-total">
                 <button onClick={handleDeleteManuscript} className="delete-btn-main">
                    Удалить заявку
                </button>
            </div>
        </>
    );
};