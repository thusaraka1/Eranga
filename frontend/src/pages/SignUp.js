//eslint-disable
import React, { Component } from "react";
import {Card, Row, Col, Form, Input, Button, message, Upload, Modal, Select} from "antd";
import Password from "antd/es/input/Password";
import Cookies from "js-cookie";
import axios from "axios";
import { encryptData, decryptData } from '../cryptoUtils';

export default class SignUp extends Component {

  constructor(props) {
    super(props);


    this.formRef = React.createRef();
  }

  componentDidMount() {
    let rememberedUser = Cookies.get('rememberedUser');

    if (rememberedUser) {
      rememberedUser = JSON.parse(rememberedUser);
      const { ROLE } = rememberedUser;
        if (ROLE !== 'ADMIN') {
            window.location.href = '/dashboard';
        }

    }
    else{
      Cookies.remove('rememberedUser');
      window.location.href = '/';
    }
  }

  handleSubmit = async (values) => {
    try {
      const { USERNAME } = values;

      //encrypt username only
        const encryptedData = encryptData({ USERNAME });

      // Check if the email and username are already in use
      const checkResponse = await axios.post('http://localhost:3001/api/checkEmailUsername', { encryptedData });

      if (checkResponse.data.used) {
        // Either email or username is already in use
        message.error('Email or username is already in use');
        return;
      }

      // Add IS_ACTIVE and CREATED_BY to the values object
      const updatedValues = {
        ...values,
        IS_ACTIVE: 1,
      };

        //encrypt data
      const encryptedData1 = encryptData(updatedValues);
      console.log(encryptedData1);

      const response = await axios.post('http://localhost:3001/api/addUser', { encryptedData1 });

      if (response.data.success) {
        message.success('User added successfully');
        // Clear the form
        this.formRef.current.resetFields();
      } else {
        message.error('Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      message.error('Internal server error');
    }
  };
  render() {
    return (
        <>
          <div className="tabled">
            <Row gutter={[16, 16]} justify="left" align="top">
              <Col xs="24" xl={24}>
                <Card
                    bordered={false}
                    className="criclebox tablespace mb-24"
                    title="Register New Users"
                >
                  <Form
                      layout="vertical"
                      onFinish={this.handleSubmit}
                      style={{ margin: '20px' }}
                      ref={this.formRef}
                  >
                    <Row gutter={[16, 16]} justify="left" align="top">
                      <Col xs={24} sm={24} md={24} lg={12}>
                        <Form.Item
                            name="NAME"
                            label="Name"
                            rules={[{ required: true, message: 'Please enter a name' }]}
                        >
                          <Input placeholder="Enter a name" style={{
                            borderRadius: '6px',
                            height: '50px',
                          }} />
                        </Form.Item>
                      </Col>
                        <Col xs={24} sm={24} md={24} lg={12}>
                            <Form.Item
                                name="ROLE"
                                label="Role"
                                initialValue="USER"
                                rules={[{ required: true, message: 'Please enter a role' }]}
                            >
                              <Select
                                    placeholder="Select a role"
                                    style={{
                                        borderRadius: '6px',
                                        height: '50px',
                                    }}
                                >
                                <Select.Option value="USER">User</Select.Option>
                                <Select.Option value="ADMIN">Admin</Select.Option>

                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]} justify="left" align="top">
                      <Col xs={24} sm={12} md={12} lg={12}>
                        <Form.Item
                            name="USERNAME"
                            label="User Name"
                            rules={[{ required: true, message: 'Please enter a username' }]}
                        >
                          <Input placeholder="Enter a username" style={{
                            borderRadius: '6px',
                            height: '50px',
                          }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={12} lg={12}>
                        <Form.Item
                            name="PASSWORD"
                            label="Password"
                            rules={[{ required: true, message: 'Please enter a password' }, { min: 8, message: 'Password must be at least 8 characters' }]}
                        >
                          <Password
                              placeholder="Enter a Password"
                              style={{
                                borderRadius: '6px',
                                height: '50px',
                              }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={[16, 16]} justify="left" align="top">
                      <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item>
                          <Button type="primary" htmlType="submit">
                            Register User
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </Card>
              </Col>
            </Row>
          </div>
        </>
    );
  }
}
