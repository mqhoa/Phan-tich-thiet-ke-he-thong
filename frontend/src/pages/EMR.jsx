import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Form, Input, Button, Modal, Card, Typography, notification, Space } from 'antd';
import { AlertOutlined, MedicineBoxOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function EMR() {
    const { user } = useContext(AuthContext);
    const [form] = Form.useForm();
    const [isChecking, setIsChecking] = useState(false);

    const handlePrescribe = async (values) => {
        setIsChecking(true);
        try {
            // Bước 1: Gọi API kiểm tra tương tác thuốc (Luồng ngoại lệ)
            const checkRes = await axios.post('http://localhost:5000/api/check-interaction', { meds: values.meds });
            
            if (checkRes.data.hasWarning) {
                // Hiển thị Popup Cảnh báo
                Modal.confirm({
                    title: 'Cảnh báo Tương tác thuốc!',
                    icon: <AlertOutlined style={{ color: 'red' }} />,
                    content: checkRes.data.message,
                    okText: 'Vẫn tiếp tục kê đơn',
                    cancelText: 'Hủy bỏ để sửa lại',
                    onOk: () => submitRx(values) // Nếu bác sĩ xác nhận vẫn kê
                });
            } else {
                submitRx(values); // Luồng bình thường
            }
        } catch (error) {
            notification.error({ message: 'Lỗi kết nối Server' });
        }
        setIsChecking(false);
    };

    const submitRx = async (values) => {
        try {
            await axios.post('http://localhost:5000/api/erx', values, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            notification.success({ message: 'Đã tạo Đơn thuốc điện tử (eRx) thành công!' });
            form.resetFields();
        } catch (error) {
            notification.error({ message: 'Không thể tạo đơn thuốc' });
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <Card 
                title={<Title level={3}><MedicineBoxOutlined /> EMR - Form Khám & Kê đơn eRx</Title>} 
                bordered={true}
                style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
            >
                <Form form={form} layout="vertical" onFinish={handlePrescribe}>
                    <Form.Item 
                        label="Mã bệnh nhân (hoặc Tên)" 
                        name="patient" 
                        rules={[{ required: true, message: 'Vui lòng nhập tên bệnh nhân!' }]}
                    >
                        <Input size="large" placeholder="Ví dụ: benhnhanA" />
                    </Form.Item>

                    <Form.Item 
                        label="Chẩn đoán lâm sàng" 
                        name="diagnosis"
                    >
                        <Input.TextArea rows={3} placeholder="Mô tả triệu chứng..." />
                    </Form.Item>

                    <Form.Item 
                        label="Chỉ định Thuốc (Kê đơn)" 
                        name="meds" 
                        rules={[{ required: true, message: 'Vui lòng nhập thuốc!' }]}
                        tooltip="Thử nhập: Aspirin và Ibuprofen để xem luồng cảnh báo"
                    >
                        <Input size="large" placeholder="Ví dụ: Aspirin 81mg, Ibuprofen 400mg..." />
                    </Form.Item>

                    <Form.Item label="Liều lượng" name="dosage">
                        <Input size="large" placeholder="Ví dụ: Ngày uống 2 lần sau ăn" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" loading={isChecking} block>
                            Phát hành Đơn thuốc điện tử (eRx)
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}