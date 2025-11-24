import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CustomBreadcrumbs } from '../components/CustomBreadcrumbs'; // <--- ИМПОРТ
import '../index.css';

const MINIO_BUCKET = 'manuscripts';
const MINIO_BASE_URL = `/${MINIO_BUCKET}/`;

const LOGO_URL = MINIO_BASE_URL + 'british-museum-logo.svg';
const DELETE_ICON_URL = MINIO_BASE_URL + 'icons8-мусорка-50.png';

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
            try {
                const response = await fetch(`/api/manuscripts/${currentId}`);
                if (response.ok) {
                    const data = await response.json();
                    const processedLetters = (data.letters || []).map((l: any) => ({
                        ...l,
                        letterID: l.Letter?.ID || l.letterID,
                        name: l.Letter?.Name || l.name,
                        description: l.Letter?.Description || l.description,
                        imageURL: (l.Letter?.ImageURL || l.imageURL).startsWith('/') 
                             ? (l.Letter?.ImageURL || l.imageURL) 
                             : MINIO_BASE_URL + (l.Letter?.ImageURL || l.imageURL),
                        quantity: l.Quantity || l.quantity
                    }));
                    
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
        try {
            await fetch(`/api/manuscript/delete/${manuscript.id}`, { method: 'POST' });
            navigate('/services');
        } catch (error) {
            console.error("Ошибка сети:", error);
        }
    };

    const handleUpdateQuantity = async (letterID: number, newQty: number) => {
        if (newQty < 1) return;
        try {
            const response = await fetch(`/api/manuscript/update/${letterID}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: newQty, manuscript_id: manuscript.id }),
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
        try {
            const response = await fetch(`/api/manuscript/remove/${letterID}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ manuscript_id: manuscript.id }),
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
            
            {/* ХЛЕБНЫЕ КРОШКИ */}
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