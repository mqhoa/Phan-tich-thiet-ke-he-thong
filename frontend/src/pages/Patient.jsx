import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Card, Table, Tag, Tabs, Typography, Button, Space, DatePicker, notification } from 'antd';
import { CalendarOutlined, FileTextOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TabPane } = Tabs;

export default function Patient() {
    const { user } = useContext(AuthContext);
    const [myRx, setMyRx] = useState([]);
    const [appointments, setAppointments] = useState([
        { id: 'ENC-001', date: '2026-06-20 08:00', doctor: 'Bác sĩ B', status: 'Confirmed' }
    ]);

    useEffect(() => {
        // Lấy lịch sử eRx của riêng bệnh nhân
        axios.get('http://localhost:5000/api/erx/my', {
            headers: { Authorization: `Bearer ${user.token}` }
        }).then(res => setMyRx(res.data)).catch(console.error);
    }, [user.token]);

    const handleBookAppointment = (date) => {
        if (!date) return;
        const newAppt = {
            id: `ENC-00${appointments.length + 1}`,
            date: date.format('YYYY-MM-DD HH:mm'),
            doctor: 'Chờ xếp lịch',
            status: 'Pending'
        };
        setAppointments([newAppt, ...appointments]);
        notification.success({ message: 'Đặt lịch thành công! Đang chờ phòng khám xác nhận.' });
    };

    const rxColumns = [
        { title: 'Mã eRx', dataIndex: 'id', key: 'id' },
        { title: 'Chỉ định thuốc', dataIndex: 'meds', key: 'meds' },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status',
            render: status => (
                <Tag color={status === 'Dispensed' ? 'green' : 'orange'}>
                    {status.toUpperCase()}
                </Tag>
            )
        }
    ];

    const apptColumns = [
        { title: 'Mã Lịch', dataIndex: 'id', key: 'id' },
        { title: 'Thời gian', dataIndex: 'date', key: 'date' },
        { title: 'Bác sĩ', dataIndex: 'doctor', key: 'doctor' },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status',
            render: status => {
                let color = status === 'Pending' ? 'orange' : status === 'Confirmed' ? 'blue' : 'green';
                return <Tag color={color}>{status}</Tag>;
            }
        }
    ];

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <Title level={3}>Cổng thông tin cá nhân - {user.username}</Title>
            
            <Tabs defaultActiveKey="1" type="card">
                <TabPane tab={<span><CalendarOutlined /> Lịch khám bệnh</span>} key="1">
                    <Card title="Đặt lịch khám mới" bordered={false} style={{ marginBottom: '20px', background: '#f0f2f5' }}>
                        <Space>
                            <DatePicker showTime format="YYYY-MM-DD HH:mm" placeholder="Chọn ngày giờ..." onChange={handleBookAppointment} />
                            <Button type="primary">Đặt lịch (Mock)</Button>
                        </Space>
                    </Card>
                    <Table dataSource={appointments} columns={apptColumns} rowKey="id" pagination={false} />
                </TabPane>
                
                <TabPane tab={<span><FileTextOutlined /> Đơn thuốc điện tử (eRx)</span>} key="2">
                    <Card title="Lịch sử đơn thuốc của bạn">
                        <Table dataSource={myRx} columns={rxColumns} rowKey="id" pagination={false} />
                    </Card>
                </TabPane>
            </Tabs>
        </div>
    );
}