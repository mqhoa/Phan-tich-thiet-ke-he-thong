import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Input, Card, Button, Typography, Tag, notification, Descriptions, Space } from 'antd';
import { MedicineBoxOutlined, SearchOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;

export default function Pharmacy() {
    const { user } = useContext(AuthContext);
    const [prescriptions, setPrescriptions] = useState([]);
    const [searchedRx, setSearchedRx] = useState(null);

    // Lấy tất cả đơn thuốc để mô phỏng "Database" (trong thực tế sẽ tìm qua API riêng)
    const fetchRx = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/erx', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setPrescriptions(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchRx(); }, [user.token]);

    const handleSearch = (value) => {
        if (!value) return;
        const found = prescriptions.find(rx => rx.id === value || rx.eRx_ID === value);
        if (found) {
            setSearchedRx(found);
            notification.success({ message: 'Đã tìm thấy đơn thuốc' });
        } else {
            setSearchedRx(null);
            notification.error({ message: 'Không tìm thấy mã đơn thuốc (eRx_ID) hợp lệ!' });
        }
    };

    const handleDispense = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/erx/${id}/dispense`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            notification.success({ message: 'Cấp phát thuốc thành công!' });
            fetchRx(); // Cập nhật lại list gốc
            setSearchedRx(prev => ({ ...prev, status: 'Dispensed' })); // Cập nhật UI ngay lập tức (MVVM)
        } catch (error) {
            notification.error({ message: 'Lỗi cấp phát hoặc đơn đã được cấp!' });
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
            <Title level={2}><MedicineBoxOutlined /> Quầy thuốc (Pharmacy)</Title>
            <p>Nhập mã đơn thuốc (eRx_ID) do bệnh nhân cung cấp để tra cứu. (Gợi ý: ERX-001)</p>
            
            {/* Thanh tìm kiếm lớn ở giữa */}
            <Search 
                placeholder="Nhập mã eRx_ID..." 
                allowClear 
                enterButton={<Button type="primary" icon={<SearchOutlined />}>Tra cứu</Button>}
                size="large" 
                onSearch={handleSearch} 
                style={{ maxWidth: '500px', marginBottom: '40px' }}
            />

            {/* Hiển thị kết quả & Nút cấp phát */}
            {searchedRx && (
                <Card 
                    title={`Chi tiết đơn thuốc: ${searchedRx.id || searchedRx.eRx_ID}`} 
                    bordered={true}
                    style={{ textAlign: 'left', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                >
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Bệnh nhân"><strong>{searchedRx.patient}</strong></Descriptions.Item>
                        <Descriptions.Item label="Chỉ định (Thuốc)">{searchedRx.meds || searchedRx.medication}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={searchedRx.status === 'Pending' ? 'orange' : 'green'}>
                                {searchedRx.status}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tồn kho">
                            <Tag color="blue">Đủ thuốc cấp phát</Tag>
                        </Descriptions.Item>
                    </Descriptions>

                    <div style={{ marginTop: '20px', textAlign: 'right' }}>
                        {searchedRx.status === 'Pending' ? (
                            <Button 
                                type="primary" 
                                size="large" 
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleDispense(searchedRx.id || searchedRx.eRx_ID)}
                            >
                                Xác nhận Cấp phát (Dispense)
                            </Button>
                        ) : (
                            <Button size="large" disabled>Đã Cấp phát</Button>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}