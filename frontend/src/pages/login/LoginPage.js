import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import './styles.css';
import Cookies from 'js-cookie';
import { encryptData, decryptData } from '../../cryptoUtils';
const Login = () => {
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const encryptedData = encryptData(values);
            const response = await axios.post('http://localhost:3001/api/login', { encryptedData });

            if (response.status === 200) {
                const decryptedData = decryptData(response.data.encryptedData);
                message.success('Login successful');
                Cookies.set('rememberedUser', JSON.stringify(decryptedData), { expires: 2 });
                history.push('/dashboard');
            } else {
                message.error(response.data.message || 'Invalid username or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            message.error('Login failed. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <Form
                    name="login-form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    className="login-form"
                >
                    <p className="form-title">Betting Application</p>
                    <p className="form-subtitle">Login</p>
                    <Form.Item
                        name="user"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input
                            prefix={<UserOutlined className="site-form-item-icon" />}
                            placeholder="Username"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            placeholder="Password"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-form-button" loading={loading}>
                            LOGIN
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default Login;
