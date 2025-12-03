import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Breadcrumb } from 'react-bootstrap';
import '../index.css';


interface CustomBreadcrumbsProps {
    lastItemTitle?: string; 
}


export const CustomBreadcrumbs: React.FC<CustomBreadcrumbsProps> = ({ lastItemTitle }) => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    if (pathnames.length === 0) return null;

    return (
        <Breadcrumb className="custom-breadcrumbs">
            {/* 1. Главная */}
            <li className="custom-breadcrumb-item">
                <Link to="/" className="breadcrumb-link">Главная</Link>
            </li>

            {/* 2. Промежуточный уровень (Список признаков) */}
            {(pathnames.includes('services') || pathnames.includes('sign') || pathnames.includes('manuscripts')) && (
                <li className="custom-breadcrumb-item">
                    <span className="separator">/</span>
                    {pathnames.includes('services') && pathnames.length === 1 ? (
                        <span className="breadcrumb-current">Список признаков</span>
                    ) : (
                        <Link to="/services" className="breadcrumb-link">Список признаков</Link>
                    )}
                </li>
            )}

            {/* 3. Детали признака (ЗДЕСЬ ИЗМЕНЕНИЕ) */}
            {pathnames.includes('sign') && (
                <li className="custom-breadcrumb-item">
                    <span className="separator">/</span>
                    <span className="breadcrumb-current">
                        {/* Если передали название - показываем его, иначе показываем ID */}
                        {lastItemTitle ? lastItemTitle : `Детали признака №${pathnames[1]}`}
                    </span>
                </li>
            )}

            {/* 4. Корзина */}
            {pathnames.includes('manuscripts') && (
                <li className="custom-breadcrumb-item">
                    <span className="separator">/</span>
                    <span className="breadcrumb-current">Ваша рукопись</span>
                </li>
            )}

            {/* 5. Логин / Регистрация */}
            {pathnames.includes('login') && (
                <li className="custom-breadcrumb-item">
                    <span className="separator">/</span>
                    <span className="breadcrumb-current">Вход</span>
                </li>
            )}
            {pathnames.includes('register') && (
                <li className="custom-breadcrumb-item">
                    <span className="separator">/</span>
                    <span className="breadcrumb-current">Регистрация</span>
                </li>
            )}
        </Breadcrumb>
    );
};