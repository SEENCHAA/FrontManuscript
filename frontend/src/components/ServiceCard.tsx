import React from 'react';
import { Link } from 'react-router-dom';
import { type Letter } from '../types';
import '../index.css';

const APP_BASE = import.meta.env.BASE_URL;
const PLACEHOLDER_URL = `${APP_BASE}placeholder.jpg`;

interface ServiceCardProps {
    letter: Letter;
    onAdd: (id: number) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ letter }) => {
    const imageUrl = letter.imageURL || PLACEHOLDER_URL;

    return (
        <div className="card">
            <div className="card-left">
                <div>
                    <h3 className="card-title">{letter.name}</h3>
                    <p className="card-text">{letter.description}</p>
                </div>
                <div className="card-actions">
                    <Link to={`/sign/${letter.id}`} className="card-detail">
                        Подробнее
                    </Link>
                </div>
            </div>
            <div className="card-right">
                <img src={imageUrl} alt={letter.name} />
            </div>
        </div>
    );
};