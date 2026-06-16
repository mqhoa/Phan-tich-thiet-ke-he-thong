import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Patient from './pages/Patient';
import EMR from './pages/EMR';
import Pharmacy from './pages/Pharmacy';
import Admin from './pages/Admin';
import AuthPage from './pages/AuthPage'; // Import giao diện Đăng ký/Đăng nhập thật
import { Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

export default function App() {
    const { user, logout } = useContext(AuthContext);

    // 1. Nếu CHƯA đăng nhập, hiển thị form AuthPage xịn xò kết nối DB
    if (!user) {
        return <AuthPage />;
    }

    // 2. Nếu ĐÃ đăng nhập, hiển thị Dashboard với Navbar dùng chung
    return (
        <div style={{ fontFamily: 'sans-serif', background: '#f0f2f5', minHeight: '100vh' }}>
            {/* Thanh Header (Navbar) */}
            <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '15px 20px', background: '#001529', color: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    Hệ thống E-Health
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span>
                        Xin chào, <strong>{user.fullName}</strong> 
                        <span style={{ marginLeft: '8px', padding: '2px 8px', background: '#1890ff', borderRadius: '12px', fontSize: '12px' }}>
                            ID: {user.accountId}
                        </span>
                    </span>
                    <Button type="primary" danger icon={<LogoutOutlined />} onClick={logout}>
                        Đăng xuất
                    </Button>
                </div>
            </div>
            
            {/* Vùng Render Nội dung cho từng phân quyền */}
            <div style={{ padding: '20px' }}>
                {user.role === 'patient' && <Patient />}
                {user.role === 'doctor' && <EMR />}
                {user.role === 'pharmacy' && <Pharmacy />}
                {user.role === 'admin' && <Admin />}
            </div>
        </div>
    );
}