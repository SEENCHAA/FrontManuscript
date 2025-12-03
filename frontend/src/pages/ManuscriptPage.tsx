import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner, Badge, Form, Button } from 'react-bootstrap';
import { CustomBreadcrumbs } from '../components/CustomBreadcrumbs';
import '../index.css';
import { MINIO_URL } from '../config';

import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../store/store';
import { 
    getManuscriptDetail, 
    updateQty, 
    removeLetter, 
    confirmManuscript, 
    deleteManuscript,
    updateManuscriptText 
} from '../store/manuscriptSlice';

// ИМПОРТИРУЕМ НАШУ УТИЛИТУ
import { getImageUrl } from '../utils/imageUrl';

const APP_BASE = import.meta.env.BASE_URL;
const DELETE_ICON_URL = `${MINIO_URL}/icons8-мусорка-50.png`;


// Компонент одной строки
const ManuscriptItem = ({ item, isDraft, onUpdate, onRemove }: any) => {
    const [localQty, setLocalQty] = useState(item.quantity);

    useEffect(() => {
        setLocalQty(item.quantity);
    }, [item.quantity]);

    const handleSave = () => {
        if (localQty !== item.quantity && localQty > 0) {
            onUpdate(item.letter_id, localQty);
        }
    };

    // ИСПОЛЬЗУЕМ УТИЛИТУ ЗДЕСЬ
    const imageSrc = getImageUrl(item.image_url);

    return (
        <div className="order-card">
            <div className="order-info">
                <img 
                    src={imageSrc} 
                    alt={item.name} 
                    onError={(e) => { e.currentTarget.src = `${APP_BASE}placeholder.jpg`; }} // Защита от битых ссылок
                />
                <div className="order-text">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                </div>
            </div>
            
            <div className="count-form">
                {isDraft ? (
                    <>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                            <Form.Control 
                                type="number" 
                                className="count-input" 
                                value={localQty} 
                                min="1" 
                                onChange={(e) => setLocalQty(parseInt(e.target.value))}
                            />
                            {localQty !== item.quantity && (
                                <Button size="sm" variant="success" onClick={handleSave} style={{fontSize: '12px', padding: '2px 5px'}}>
                                    Сохр.
                                </Button>
                            )}
                        </div>
                        
                        <button className="delete-btn" onClick={() => onRemove(item.letter_id)}>
                            <img src={DELETE_ICON_URL} alt="Удалить" className="delete-icon" />
                        </button>
                    </>
                ) : (
                    <span className="text-white fs-5">Количество: {item.quantity}</span>
                )}
            </div>
        </div>
    );
};

export const ManuscriptPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    
    const { letters, manuscriptData, isDraft, isLoading } = useSelector((state: RootState) => state.manuscripts);
    const [textInput, setTextInput] = useState('');

    useEffect(() => {
        if (id) dispatch(getManuscriptDetail(Number(id)));
    }, [id, dispatch]);

    useEffect(() => {
        if (manuscriptData) setTextInput(manuscriptData.manuscript_text || '');
    }, [manuscriptData]);

    const handleUpdateQuantity = (letterID: number, newQty: number) => {
        dispatch(updateQty({ mId: Number(id), lId: letterID, qty: newQty }));
    };

    const handleRemoveLetter = (letterID: number) => {
        dispatch(removeLetter({ mId: Number(id), lId: letterID }));
    };

    const handleSaveText = () => {
        dispatch(updateManuscriptText({ id: Number(id), text: textInput }));
    };

    const handleConfirm = () => {
        dispatch(confirmManuscript(Number(id))).then(() => navigate('/orders'));
    };

    const handleDeleteOrder = () => {
        dispatch(deleteManuscript(Number(id))).then(() => navigate('/services'));
    };

    if (isLoading) return <div className="text-center mt-5"><Spinner animation="border" variant="light" /></div>;
    if (!manuscriptData || !manuscriptData.id) return <div className="text-center mt-5 text-white">Заявка не найдена</div>;

    return (
        <>
            <div className="site-header" style={{height: '120px', visibility: 'hidden'}}></div>
            <CustomBreadcrumbs />

            <div className="order-container">
                <div className="title-row" style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h1>
                        Заявка №{manuscriptData.id} 
                        <Badge bg={isDraft ? "warning" : "success"} className="ms-3">
                            {manuscriptData.status}
                        </Badge>
                    </h1>
                    
                    
                </div>

                <div className="order-period">
                    <h3>Предварительный расчет:</h3>
                    <p className="order-period-value">
                        {manuscriptData.calculated_period ? <strong>{manuscriptData.calculated_period}</strong> : <em>Будет рассчитан после подтверждения</em>}
                    </p>
                </div>

                <div style={{ background: '#1D1D1D', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3 style={{color: 'white', marginBottom: '15px'}}>Текст рукописи</h3>
                    <Form.Group>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            disabled={!isDraft}
                            style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #444' }}
                        />
                    </Form.Group>
                    {isDraft && (
                        <Button variant="secondary" onClick={handleSaveText} style={{ marginTop: '10px', width: '100%' }}>
                            Сохранить текст
                        </Button>
                    )}
                </div>

                {letters && letters.length > 0 ? (
                    letters.map((item: any) => (
                        
                        <ManuscriptItem 
                            key={item.letter_id}
                            item={item} 
                            isDraft={isDraft}
                            onUpdate={handleUpdateQuantity}
                            onRemove={handleRemoveLetter}
                        />
                    ))
                ) : (
                    <div className="order-empty">В этой заявке нет услуг</div>
                )}
            </div>

            {isDraft && (
                <div className="order-total" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                     <button onClick={handleConfirm} className="delete-btn-main" style={{backgroundColor: '#f2d70a', color: '#000'}}>
                        Подтвердить и отправить на расчет
                    </button>
                    <button onClick={handleDeleteOrder} className="delete-btn-main" style={{backgroundColor: '#dc3545', color: '#fff'}}>
                        Удалить черновик
                    </button>
                </div>
            )}
        </>
    );
};