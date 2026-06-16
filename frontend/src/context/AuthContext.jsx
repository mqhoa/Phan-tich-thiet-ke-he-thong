import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Kiểm tra xem trình duyệt có lưu session cũ không
    useEffect(() => {
        const storedUser = localStorage.getItem('ehealth_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Lỗi đọc dữ liệu cũ", error);
            }
        }
    }, []);

    // Hàm login phiên bản MỚI (nhận cục dữ liệu và token)
    const login = (userData, token) => {
        const sessionData = { ...userData, token };
        setUser(sessionData);
        localStorage.setItem('ehealth_user', JSON.stringify(sessionData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ehealth_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};