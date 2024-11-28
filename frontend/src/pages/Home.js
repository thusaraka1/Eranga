// /* eslint-disable */
import React, {Component} from 'react';
import {Button, Card, Col, DatePicker, Form, Input, message, Row, Select, Table} from 'antd';
import axios from 'axios';
import Cookies from "js-cookie";
import { encryptData, decryptData } from '../cryptoUtils';



const { Option } = Select;
const { RangePicker } = DatePicker;


class Home extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      loading: false,
      filteredTableData: [],
      isUpdateModalVisible: false,
      selectedItem: null,
      tableData: [],
      searchStatus: '',

    };

    // Bind methods
    this.getAllBetData = this.getAllBetData.bind(this);

  }

  async componentDidMount() {
    await this.getAllBetData();
  }


  async getAllBetData() {
    //console.log('getAllMovementData');
    this.setState({ loading: true });
    let rememberedUser = Cookies.get('rememberedUser');
    let ROLE = null;

    if (rememberedUser) {
      rememberedUser = JSON.parse(rememberedUser);
      ROLE = rememberedUser.ROLE;
    }

    //return if not admin
    if (ROLE !== 'ADMIN') {
      return;
    }

    try {
      let response;
        response = await axios.get('http://localhost:3001/api/bets');

      if (response.data.success) {
          console.log(response.data.result);
          //decrypt data response.data.result array one by one
          let decryptedDataArray = [];
          for (let i = 0; i < response.data.result.length; i++) {
                decryptedDataArray.push(decryptData(response.data.result[i]));
          }
          console.log(decryptedDataArray);
        this.state.tableData = decryptedDataArray;
      } else {
        //console.log('Error:', response.data.message);
      }
    } catch (error) {
      //console.log('Error:', error.message);
    } finally {
      this.setState({
        loading: false,
      });
    }
  }

    handleSubmit = async (values) => {
        try {
            const { ITEM, BET_AMOUNT } = values;
            let rememberedUser = Cookies.get('rememberedUser');
            let USER_ID = null;

            if (rememberedUser) {
                rememberedUser = JSON.parse(rememberedUser);
                USER_ID = rememberedUser.USER_ID;
            }

            const encryptedData = encryptData({ item: ITEM, betAmount: BET_AMOUNT, userId: USER_ID });

            const response = await axios.post('http://localhost:3001/api/bets', {
                encryptedData }
            );

            if (response.data.success) {
                message.success('Bet added successfully');
                this.getAllBetData();
                // Clear the form
                this.formRef.current.resetFields();
            } else {
                message.error('Failed to add bet');
            }
        } catch (error) {
            console.error('Error adding bet:', error);
        }
    }







  render() {

    const buttonStyle = {
      width: '50px',
      height: '50px',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    let rememberedUser = Cookies.get('rememberedUser');
    let ROLE = null;

    if (rememberedUser) {
      rememberedUser = JSON.parse(rememberedUser);
      ROLE = rememberedUser.ROLE;
    }


    return (
        <>

          <div className="tabled">
            <Row gutter={[16, 16]} justify="left" align="top">
              <Col xs="24" xl={24}>
                {ROLE === 'ADMIN' &&
                <Card
                    bordered={false}
                    className="criclebox tablespace mb-24"
                    title='Bet Data'
                >
                    <Table
                        dataSource={this.state.tableData}
                        loading={this.state.loading}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 1000 }}

                    >
                        <Table.Column
                            title="User ID"
                            dataIndex="userName"
                            key="USER Name"
                        />
                        <Table.Column
                            title="Item"
                            dataIndex="item"
                            key="ITEM"
                        />
                        <Table.Column
                            title="Bet Amount"
                            dataIndex="betAmount"
                            key="BET AMOUNT"
                        />
                    </Table>
                </Card>
                }
                {ROLE === 'USER' &&
                <Card
                    bordered={false}
                    className="criclebox tablespace mb-24"
                    title='Bet Data'
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
                                name="ITEM"
                                label="Item"
                                rules={[{ required: true, message: 'Please enter a item' }]}
                            >
                            <Input placeholder="Enter a item" style={{
                                borderRadius: '6px',
                                height: '50px',
                            }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={12}>
                            <Form.Item
                                name="BET_AMOUNT"
                                label="Bet Amount"
                                rules={[{ required: true, message: 'Please enter a bet amount' }]}
                            >
                            <Input placeholder="Enter a bet amount" style={{
                                borderRadius: '6px',
                                height: '50px',
                            }} />
                            </Form.Item>
                        </Col>
                        </Row>
                        <Row gutter={[16, 16]} justify="left" align="top">
                        <Col xs={24} sm={24} md={24} lg={12}>
                            <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{
                                    borderRadius: '6px',
                                    height: '50px',
                                    width: '100%',
                                }}
                            >
                                Submit
                            </Button>
                            </Form.Item>
                        </Col>
                        </Row>
                    </Form>
                </Card>
                }
              </Col>
            </Row>
          </div>
        </>
    );
  }
}

export default Home;
