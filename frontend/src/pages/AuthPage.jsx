import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Card, Tabs, Form, Input, Button, Select, notification, Typography } from 'antd';

import { UserOutlined, LockOutlined, SafetyCertificateOutlined, IdcardOutlined, PhoneOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { TabPane } = Tabs;

export default function AuthPage() {
    const { login } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    // Xử lý Gửi API Đăng nhập
    const handleLogin = async (values) => {
        setLoading(true);
        try {
            // Đổi chữ localhost thành địa chỉ IP gốc 127.0.0.1
            const res = await axios.post('http://127.0.0.1:5000/api/auth/login', values);
            notification.success({ message: 'Đăng nhập thành công!' });
            login(res.data.user, res.data.token);
        } catch (error) {
            notification.error({ 
                message: 'Đăng nhập thất bại', 
                // Nâng cấp bộ bắt lỗi: Bắt đúng tên biến error hoặc in ra lỗi gốc
                description: error.response?.data?.message || error.response?.data?.error || error.message || 'Lỗi kết nối server' 
            });
        }
        setLoading(false);
    };

    // Xử lý Gửi API Đăng ký
    const handleRegister = async (values) => {
        setLoading(true);
        try {
            // Đổi chữ localhost thành địa chỉ IP gốc 127.0.0.1
            await axios.post('http://127.0.0.1:5000/api/auth/register', values);
            notification.success({ 
                message: 'Đăng ký thành công!', 
                description: 'Bạn có thể chuyển sang tab Đăng nhập để truy cập hệ thống.' 
            });
        } catch (error) {
            notification.error({ 
                message: 'Đăng ký thất bại', 
                // Nâng cấp bộ bắt lỗi
                description: error.response?.data?.message || error.response?.data?.error || error.message || 'Lỗi kết nối server' 
            });
        }
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Title level={3} style={{ color: '#1890ff' }}><SafetyCertificateOutlined /> E-Health System</Title>
                </div>
                
                <Tabs defaultActiveKey="1" centered>
                    {/* TAB ĐĂNG NHẬP */}
                    <TabPane tab="Đăng nhập" key="1">
                        <Form layout="vertical" onFinish={handleLogin}>
                            <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}>
                                <Input prefix={<UserOutlined />} size="large" placeholder="Tên đăng nhập" />
                            </Form.Item>
                            <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                                <Input.Password prefix={<LockOutlined />} size="large" placeholder="Mật khẩu" />
                            </Form.Item>
                            <Form.Item name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên thật!' }]}>
                                <Input prefix={<IdcardOutlined />} size="large" placeholder="Họ và tên đầy đủ" />
                            </Form.Item>
                            
                            <Form.Item name="phone">
                                <Input prefix={<PhoneOutlined />} size="large" placeholder="Số điện thoại liên hệ" />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                                Đăng nhập
                            </Button>
                        </Form>
                    </TabPane>

                    {/* TAB ĐĂNG KÝ */}
                    <TabPane tab="Đăng ký" key="2">
                        <Form layout="vertical" onFinish={handleRegister}>
                            <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}>
                                <Input prefix={<UserOutlined />} size="large" placeholder="Tên đăng nhập" />
                            </Form.Item>
                            <Form.Item name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên thật!' }]}>
                                <Input prefix={<IdcardOutlined />} size="large" placeholder="Họ và tên đầy đủ" />
                            </Form.Item>
                            
                            {/* Ô SỐ ĐIỆN THOẠI */}
                            <Form.Item name="phone">
                                <Input prefix={<PhoneOutlined />} size="large" placeholder="Số điện thoại liên hệ" />
                            </Form.Item>
                            <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                                <Input.Password prefix={<LockOutlined />} size="large" placeholder="Mật khẩu" />
                            </Form.Item>
                            <Form.Item name="role" label="Đăng ký với vai trò:" initialValue="patient">
                                <Select size="large">
                                    <Select.Option value="patient">Bệnh nhân (Patient)</Select.Option>
                                    <Select.Option value="doctor">Bác sĩ (Doctor)</Select.Option>
                                    <Select.Option value="pharmacy">Dược sĩ (Pharmacy)</Select.Option>
                                    <Select.Option value="admin">Quản trị viên (Admin)</Select.Option>
                                </Select>
                            </Form.Item>
                            <Button type="default" htmlType="submit" size="large" block loading={loading}>
                                Đăng ký tài khoản
                            </Button>
                        </Form>
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
}