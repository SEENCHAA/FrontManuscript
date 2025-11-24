// src/pages/ServicesPage.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 
import { ServiceCard } from '../components/ServiceCard';
import { CustomBreadcrumbs } from '../components/CustomBreadcrumbs'; // Хлебные крошки
import { type Letter } from '../types';
import { MOCK_LETTERS } from '../mockData'; 
import '../index.css';

// Константы
const MINIO_BUCKET = 'manuscripts';
const MINIO_BASE_URL = `/${MINIO_BUCKET}/`;

const LOGO_URL = MINIO_BASE_URL + 'british-museum-logo.svg';
const MATRYOSHKA_ACTIVE_URL = MINIO_BASE_URL + 'icons8-матрешка-48.png';
const MATRYOSHKA_INACTIVE_URL = MINIO_BASE_URL + 'icons8-matryoshka-unaktiv.png';

export const ServicesPage: React.FC = () => {
    const [letters, setLetters] = useState<Letter[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isMock, setIsMock] = useState<boolean>(false);
    const [totalOrderCount, setTotalOrderCount] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // --- 1. Функция получения количества товаров в корзине ---
    const fetchOrderCount = async () => {
        // Проверяем токен. Если нет токена — корзина недоступна (0)
        const token = localStorage.getItem('token');
        if (!token) {
            setTotalOrderCount(0);
            return;
        }

        try {
            // Запрашиваем состояние корзины
            const response = await fetch('/api/manuscripts/basket', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` // Обязательно для userAuth
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                // В ответе ищем массив букв (Letters)
                // Go возвращает ключи с Большой буквы
                const lettersList = data.Letters || [];

                // Считаем сумму всех Quantity
                const total = lettersList.reduce((sum: number, item: any) => {
                    // Если поля Quantity нет, считаем за 1
                    return sum + (item.Quantity || 1);
                }, 0);

                setTotalOrderCount(total);
            } else {
                // Если 404 (корзины нет) или 401 (токен протух)
                setTotalOrderCount(0);
            }
        } catch (e) {
            console.error('Ошибка сети при получении корзины:', e);
            setTotalOrderCount(0);
        }
    };
    
    // --- 2. Функция загрузки списка букв ---
    useEffect(() => {
        const fetchLetters = async () => {
            setLoading(true);
            setIsMock(false);
            
            const url = `/api/letters?filter=${encodeURIComponent(searchTerm)}`;

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                // Получаем "сырые" данные от Go (ID, Name, ImageURL...)
                const rawData = await response.json();
                
                // Преобразуем их для React (id, name, imageURL...)
                const processedLetters: Letter[] = rawData.map((item: any) => {
                    
                    // Обработка ссылки на картинку
                    let img = item.ImageURL || "";
                    
                    if (img.includes('127.0.0.1:9000')) {
                        img = img.replace('http://127.0.0.1:9000', '');
                    } else if (!img.startsWith('/') && !img.startsWith('http')) {
                        // Если пришло просто имя файла "file.jpg"
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
                console.error("Ошибка загрузки данных, включаем Mock:", error);
                setIsMock(true);
                
                // Логика для Mock-данных (если бекенд упал)
                const filteredMock = MOCK_LETTERS.filter(letter => 
                    letter.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setLetters(filteredMock.map(letter => ({
                    ...letter,
                    // Формируем путь к картинкам для моков
                    imageURL: letter.imageURL.startsWith('http') 
                        ? letter.imageURL 
                        : MINIO_BASE_URL + letter.imageURL.split('/').pop()
                })));
            } finally {
                setLoading(false);
            }
        };

        fetchLetters();
        fetchOrderCount(); // Обновляем счетчик при загрузке страницы
    }, [searchTerm]);


    // --- 3. Функция добавления в корзину ---
    const handleAddLetterToManuscript = async (letterID: number) => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            alert('Пожалуйста, войдите в систему, чтобы добавить букву в рукопись.');
            // Можно сделать редирект на /login
            return;
        }

        try {
            // URL согласно вашему handler.go: letters.POST("/:id/manuscript", ...)
            const response = await fetch(`/api/letters/${letterID}/manuscript`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Обязательный токен
                },
                body: JSON.stringify({}), // Пустое тело, если бекенд не требует данных
            });
            
            if (response.ok) {
                // Если успешно добавили, обновляем счетчик корзины
                fetchOrderCount();
            } else {
                // Обработка ошибок (например, если токен истек)
                if (response.status === 401) {
                    alert('Сессия истекла. Пожалуйста, войдите снова.');
                } else {
                    alert(`Ошибка добавления. Статус: ${response.status}`);
                }
            }
        } catch (error) {
            console.error("Ошибка сети:", error);
            alert('Не удалось связаться с сервером.');
        }
    };

    return (
        <>
            {/* Хедер */}
            <div className="site-header">
                <div className="header-left">
                    <Link to="/services">
                        <img src={LOGO_URL} alt="Логотип" className="logo" />
                    </Link>
                </div>
            </div>

            {/* Хлебные крошки */}
            <CustomBreadcrumbs />

            {/* Строка заголовка и управления */}
            <div className="title-row">
                <h1>Список признаков</h1>
                <div className="title-controls">
                    {/* Поиск */}
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Поиск признака..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {/* Иконка корзины (Матрешка) */}
                    {/* Ссылка ведет на корзину. ID=1 пока как заглушка или ID реальной рукописи */}
                    <Link 
                        to="/manuscripts/1" 
                        className={`order-link ${totalOrderCount === 0 ? 'disabled' : ''}`}
                    >
                        <img 
                            src={totalOrderCount > 0 ? MATRYOSHKA_ACTIVE_URL : MATRYOSHKA_INACTIVE_URL} 
                            alt="Матрешка" 
                            className="order-icon" 
                        />
                        {totalOrderCount > 0 && <span className="order-count">{totalOrderCount}</span>}
                    </Link>
                </div>
            </div>

            {/* Уведомление, если работаем на Mock-данных */}
            {isMock && (
                <div style={{ textAlign: 'center', color: '#f2d70a', margin: '10px' }}>
                     Нет связи с сервером. Показаны демонстрационные данные.
                </div>
            )}
            
            {/* Сетка карточек */}
            <div className="grid">
                {loading ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#fff' }}>
                        Загрузка...
                    </div>
                ) : (
                    letters.map((letter) => (
                        <ServiceCard 
                            key={letter.id} 
                            letter={letter} 
                            onAdd={handleAddLetterToManuscript} 
                        />
                    ))
                )}
                
                {letters.length === 0 && !loading && (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#B6BCBF' }}>
                        По вашему запросу ничего не найдено.
                    </p>
                )}
            </div>
        </>
    );
};