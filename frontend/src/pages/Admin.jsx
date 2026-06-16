import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Table, Typography, Card, Input, Space } from 'antd';
import { SecurityScanOutlined, SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;

export default function Admin() {
    const { user } = useContext(AuthContext);
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/logs', {
            headers: { Authorization: `Bearer ${user.token}` }
        }).then(res => {
            setLogs(res.data);
            setFilteredLogs(res.data);
        }).catch(console.error);
    }, [user.token]);

    const handleSearch = (value) => {
        const filtered = logs.filter(log => 
            log.action.toLowerCase().includes(value.toLowerCase()) || 
            log.user.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredLogs(filtered);
    };

    const columns = [
        { 
            title: 'Thời gian (Timestamp)', 
            dataIndex: 'time', 
            key: 'time',
            render: time => new Date(time).toLocaleString()
        },
        { 
            title: 'Tài khoản thao tác', 
            dataIndex: 'user', 
            key: 'user',
            render: text => <strong>{text}</strong>
        },
        { 
            title: 'Nội dung thay đổi (Action)', 
            dataIndex: 'action', 
            key: 'action' 
        }
    ];

    return (
        <div style={{ padding: '20px' }}>
            <Title level={3}><SecurityScanOutlined /> Admin Dashboard - System Audit Logs</Title>
            
            <Card style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.05)' }}>
                <Space style={{ marginBottom: 16 }}>
                    <Search 
                        placeholder="Tìm theo mã eRx, tài khoản..." 
                        allowClear 
                        onSearch={handleSearch} 
                        style={{ width: 300 }} 
                        enterButton={<SearchOutlined />}
                    />
                </Space>
                <Table 
                    dataSource={filteredLogs} 
                    columns={columns} 
                    rowKey="time" 
                    pagination={{ pageSize: 10 }} 
                    size="middle"
                />
            </Card>
        </div>
    );
}