import React, { useEffect, useState } from 'react';
import { Table, Container, Button, Spinner, Badge, Form, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders, moderateManuscript } from '../store/manuscriptSlice';
import { type AppDispatch, type RootState } from '../store/store';
import { useNavigate } from 'react-router-dom';
import { CustomBreadcrumbs } from '../components/CustomBreadcrumbs';

export const MyOrdersPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    
    const { orders, isLoading } = useSelector((state: RootState) => state.manuscripts);
    const { user } = useSelector((state: RootState) => state.auth);

    
    const [statusFilter, setStatusFilter] = useState('');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');

    const role = user?.role || "Buyer";
    const isAdminOrManager = role === 'Admin' || role === 'Manager';

    
    useEffect(() => {
        const params: any = {};
        if (statusFilter) params.status = statusFilter;
        if (dateStart) params.start = dateStart;
        if (dateEnd) params.end = dateEnd;
        
        dispatch(fetchMyOrders(params));
    }, [dispatch, statusFilter, dateStart, dateEnd]);

    const handleModerate = (id: number, status: 'finished' | 'rejected') => {
        dispatch(moderateManuscript({ id, status }));
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString().slice(0, 5);
    };

    return (
        <>
            <div className="site-header" style={{height: '80px', visibility: 'hidden'}}></div>
            <CustomBreadcrumbs />
            <Container className="mt-4">
                <h2 className="text-white mb-4">
                    {isAdminOrManager ? 'Все заявки системы' : 'Мои заявки'}
                </h2>

                {/* БЛОК ФИЛЬТРОВ */}
                <div style={{ background: '#1D1D1D', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <Row className="align-items-end">
                        <Col md={3}>
                            <Form.Label className="text-white">Статус</Form.Label>
                            <Form.Select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ background: '#222', color: '#fff', border: '1px solid #444' }}
                            >
                                <option value="">Все статусы</option>
                                <option value="draft">Черновик</option>
                                <option value="submitted">На модерации</option>
                                <option value="finished">Посчитано</option>
                                <option value="rejected">Отклонено</option>
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Label className="text-white">С даты</Form.Label>
                            <Form.Control 
                                type="date" 
                                value={dateStart}
                                onChange={(e) => setDateStart(e.target.value)}
                                style={{ background: '#222', color: '#fff', border: '1px solid #444' }}
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Label className="text-white">По дату</Form.Label>
                            <Form.Control 
                                type="date" 
                                value={dateEnd}
                                onChange={(e) => setDateEnd(e.target.value)}
                                style={{ background: '#222', color: '#fff', border: '1px solid #444' }}
                            />
                        </Col>
                        <Col md={3}>
                            <Button variant="outline-secondary" className="w-100" onClick={() => {
                                setStatusFilter(''); setDateStart(''); setDateEnd('');
                            }}>
                                Сбросить
                            </Button>
                        </Col>
                    </Row>
                </div>

                {isLoading ? (
                    <div className="text-center text-white"><Spinner animation="border"/></div>
                ) : (
                    <div className="table-responsive">
                        <Table striped bordered hover variant="dark">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    {/* Имя пользователя показываем админу */}
                                    {isAdminOrManager && <th>Пользователь</th>}
                                    
                                    <th>Статус</th>
                                    <th>Создано</th>
                                    <th>Завершено</th>
                                    
                                    {isAdminOrManager && <th>Модератор</th>}
                                    
                                    <th>Период</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order: any) => (
                                    <tr key={order.id}>
                                        <td>{order.id}</td>
                                        {isAdminOrManager && <td>{order.username || '—'}</td>}
                                        
                                        <td>
                                            <Badge bg={
                                                order.status === 'finished' ? 'success' : 
                                                order.status === 'rejected' ? 'danger' : 
                                                order.status === 'submitted' ? 'info' : 'warning'
                                            }>
                                                {order.status === 'draft' ? 'Черновик' :
                                                 order.status === 'submitted' ? 'На модерации' :
                                                 order.status === 'finished' ? 'Посчитано' :
                                                 order.status === 'rejected' ? 'Отклонено' : order.status}
                                            </Badge>
                                        </td>
                                        <td>{formatDate(order.created_at)}</td>
                                        <td>{formatDate(order.finished_at)}</td>
                                        
                                        {isAdminOrManager && <td>
                                            {order.moderator_id 
                                                ? `${order.moderator_name || 'ID:' + order.moderator_id}` 
                                                : '—'}
                                        </td>}
                                        
                                        <td>{order.calculated_period || '—'}</td>
                                        
                                        <td>
                                            <div style={{display: 'flex', gap: '5px', flexDirection: 'column'}}>
                                                <Button 
                                                    variant="outline-light" 
                                                    size="sm" 
                                                    onClick={() => navigate(`/manuscripts/${order.id}`)}
                                                >
                                                    Открыть
                                                </Button>

                                                {/* Кнопки для Админа/Модератора, если заявка на проверке */}
                                                {isAdminOrManager && order.status === 'submitted' && (
                                                    <>
                                                        <Button 
                                                            variant="success" 
                                                            size="sm"
                                                            onClick={() => handleModerate(order.id, 'finished')}
                                                        >
                                                            Завершить
                                                        </Button>
                                                        <Button 
                                                            variant="danger" 
                                                            size="sm"
                                                            onClick={() => handleModerate(order.id, 'rejected')}
                                                        >
                                                            Отклонить
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        {orders.length === 0 && <p className="text-center text-white">Заявок не найдено</p>}
                    </div>
                )}
            </Container>
        </>
    );
};