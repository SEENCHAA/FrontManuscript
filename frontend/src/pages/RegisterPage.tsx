import React, { useState } from 'react';
import { Form, Button, Container, Alert, InputGroup } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { registerUser } from '../store/authSlice';
import { type AppDispatch } from '../store/store';
import { useNavigate } from 'react-router-dom';
import { CustomBreadcrumbs } from '../components/CustomBreadcrumbs'; 

export const RegisterPage: React.FC = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await dispatch(registerUser({ username: login, password }));
        
        if (registerUser.fulfilled.match(result)) {
            navigate('/login');
        } else {
            setError(result.payload as string);
        }
    };

    return (
        <>
            <div className="site-header" style={{height: '120px', visibility: 'hidden'}}></div>
            <CustomBreadcrumbs /> {/* Добавили крошки */}
            
            <Container style={{ maxWidth: '400px', marginTop: '50px' }}>
                <h2 className="text-white text-center mb-4">Регистрация</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Control 
                            type="text" 
                            placeholder="Логин" 
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <InputGroup>
                            <Form.Control 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Пароль" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button 
                                variant="secondary" 
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ backgroundColor: '#444', borderColor: '#555' }}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </Button>
                        </InputGroup>
                    </Form.Group>
                    <Button variant="warning" type="submit" className="w-100">
                        Зарегистрироваться
                    </Button>
                </Form>
            </Container>
        </>
    );
};