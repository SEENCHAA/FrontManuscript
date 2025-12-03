import React from 'react';
import { Container, Button, Form } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '../store/store';
import { logout } from '../store/authSlice';
import { resetFilters } from '../store/filterSlice';
import { clearManuscriptState } from '../store/manuscriptSlice';
import { useNavigate } from 'react-router-dom';
import { CustomBreadcrumbs } from '../components/CustomBreadcrumbs';

export const ProfilePage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        dispatch(resetFilters());
        dispatch(clearManuscriptState());
        navigate('/');
    };

    return (
        <>
            <div className="site-header" style={{height: '120px', visibility: 'hidden'}}></div>
            <CustomBreadcrumbs />

            <Container className="mt-4 pt-2 text-white">
                <h2>Личный кабинет</h2>
                <div className="bg-dark p-4 rounded mt-3">
                    <p><strong>Логин:</strong> {user?.login || user?.login}</p>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Сменить пароль</Form.Label>
                        <Form.Control type="password" placeholder="Новый пароль" disabled />
                    </Form.Group>
                    <Button variant="danger" onClick={handleLogout}>Выход</Button>
                </div>
            </Container>
        </>
    );
};