import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Table, Button, Select, Modal, Form, InputNumber, DatePicker, message } from 'antd';
import { prefix } from '.';
import Papaparser from '../PapaParser';
import { IParseResult, ICategories, ICategory, IBill, IBillItem } from '../types';
import { parseMilisecond } from '../utils';

const Option = Select.Option;
const offset = moment().utcOffset();

function App() {
  const [originCategories, setOriginCategories] = useState<ICategory[]>([]);
  const [categories, setCategories] = useState<ICategories>({});
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [years, setYears] = useState<number[]>();
  const [months, setMonths] = useState<{[index: string]: Set<number>}>();
  const [yearSelected, setYearSelected] = useState<number>();
  const [monthSelected, setMonthSelected] = useState<number>();
  const [tableData, setTableData] = useState<any>();
  const [tableColumns, setTableColumns] = useState<any>();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [originBill, setOriginBill] = useState<IBill>([]);
  const [bill, setBill] = useState<IBill>([]);
  const [billLoaded, setBillLoaded] = useState(false);
  const [formCategory, setFormCategory] = useState<string>();

  const [categoryFileName, setCategoryFileName] = useState<string>('');
  const [billFileName, setBillFileName] = useState<string>('');

  const [form] = Form.useForm();

  useEffect(() => {
    let data: any[] = [];
    let columnSum: {[index: string]: any} = {};

    let newBill = bill;
    if(yearSelected && monthSelected){
      newBill = newBill.filter((item: any) => item.year === yearSelected && item.month === monthSelected);
    }

    newBill.forEach((item: IBillItem) => {
      data.push({
        [item.category]: item.amount,
        date: item.fullString,
        year: item.year,
        month: item.month,
        day: item.date,
        id: `${item.time}-${item.category}-${item.amount}`
      })

      if(yearSelected && monthSelected){
        if(!columnSum[item.category]){
          columnSum[item.category] = item.amount;
          columnSum['id'] = 'columnSum';
          columnSum['outcome'] = 0;
          columnSum['income'] = 0;
          columnSum['date'] = `${item.year}-${item.month}`;

        } else {
          columnSum[item.category] = columnSum[item.category] + item.amount;
        }
      }
    });

    if(Object.keys(columnSum).length > 0){
      for(let i of Object.keys(columnSum)){
        if(categories[i]){
          if(categories[i].type === 0){
            columnSum['outcome'] = columnSum['outcome'] + columnSum[i];
          } else if(categories[i].type === 1){
            if(columnSum[i] > 0){
              columnSum['income'] = columnSum['income'] + columnSum[i];
            } else {
              columnSum['outcome'] = columnSum['outcome'] - columnSum[i];
            }
          }
        }

      }
    }

    let result = data.sort((a, b) => (a.year - b.year) || (a.month - b.month) || (a.day - b.day) );

    if(yearSelected && monthSelected){
      result = [
        columnSum,
        ...result,
      ]
    }

    setTableData(result);

    const columns = getTableColumns(columnSum);
    setTableColumns(columns);
    // eslint-disable-next-line
  }, [categoriesLoaded, billLoaded, bill, yearSelected, monthSelected])

  const handleCategories = (params: IParseResult) => {
    const {
      data = [],
      errors,
      meta,
    } = params || {}

    if(Array.isArray(errors) && errors.length === 0){
      const {
        fields = [],
      } = meta || {}

      if(
        !fields.includes('id')
        || !fields.includes('name')
        || !fields.includes('type')
        || fields.length !== 3
      ){
        message.warn(`This is not categories.csv, please choose categories.csv`);
        setCategoryFileName('');
        return;
      }
      setOriginCategories(data);

      let categories: ICategories = {};
      data.forEach((category: ICategory) => {
        categories[category.id] = {
          ...category,
          type: category.type - 0,
        };
      })

      setCategories(categories);
      setCategoriesLoaded(true);
      message.success('File added successed!')
    } else {
      console.error('handleCategories errors', errors)
    }
  }

  const handleBill = (params: IParseResult) => {
    const {
      data = [],
      errors,
      meta,
    } = params || {}

    if(Array.isArray(errors) && errors.length === 0){
      const {
        fields = [],
      } = meta || {}

      if(
        !fields.includes('amount')
        ||!fields.includes('category')
        || !fields.includes('time')
        || !fields.includes('type')
        || fields.length !== 4
      ){
        message.warn(`This is not bill.csv, please choose bill.csv`);
        setBillFileName('');
        return;
      }
      setOriginBill(data);

      handleBillData(data);
      message.success('File added successed!')
    } else {
      console.error('handleBill errors', errors)
    }
  }

  const handleBillData = (data: any) => {
    let newData: IBill = [];
    let allMonths: {[index: string]: Set<number>} = {};
    let allYears = new Set<number>();
    data.forEach((item: any) => {
      const newTime = item.time - 0;

      const {
        year,
        month,
        fullString,
        date,
      } = parseMilisecond(newTime);

      allYears.add(year);
      if(!allMonths[year]){
        allMonths[year] = new Set();
        allMonths[year].add(0);
        allMonths[year].add(month);
      } else {
        allMonths[year].add(month);
      }

      return newData.push({
        type: item.type - 0,
        category: item.category,
        time: newTime,
        amount: item.amount - 0,
        year,
        month,
        date,
        fullString,
      })
    })

    setYears([...allYears.values()].sort((a, b) => a - b));
    setMonths(allMonths);

    setBill(newData);
    setBillLoaded(true);
  }

  const getTableColumns = (columnsData: {[index: string]: any}) => {
    let columns: ICategory[] = [];

    originCategories.forEach((item: ICategory) => columns.push({
      title: item.name,
      dataIndex: item.id,
    }));

    let outcomes: any[] = [];
    let incomes: any[] = [];

    columns.forEach((column) => {
      if(categories[column.dataIndex].type === 0){
        outcomes.push(column);

      } else if(categories[column.dataIndex].type === 1){
        if(columnsData[column.dataIndex] > 0){
          incomes.push(column);
        } else {
          outcomes.push(column);
        }
      }
    })

    outcomes = outcomes.sort((a, b) => Math.abs(columnsData[b.dataIndex] || 0) - Math.abs(columnsData[a.dataIndex] || 0));
    incomes = incomes.sort((a, b) => Math.abs(columnsData[a.dataIndex] || 0) - Math.abs(columnsData[b.dataIndex] || 0));

    const start = [
      {
        title: '日期',
        dataIndex: 'date',
      }
    ]

    const ends = [
      {
        title: '收入',
        dataIndex: 'income',
      },
      {
        title: '支出',
        dataIndex: 'outcome',
      },
    ]

    return [
      ...start,
      ...outcomes,
      ...incomes,
      ...(yearSelected && monthSelected ? ends : [])
    ];
  }


  const handleAddModal = async() => {
    try {
      const values = await form.validateFields();

      const time =  moment(values.time).utcOffset(offset).valueOf();
      const newValues = {
        ...values,
        time,
        type: categories[values.category].type,
      }

      const billData = [...originBill, newValues];
      setOriginBill(billData);
      handleBillData(billData);
      setShowAddModal(false);
      form.setFieldsValue({
        time: '',
        category: '',
        amount: '',
      });
      message.success('Row added successed!')
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  }

  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };

  const getInput = () => {
    const mayNegtive = ["1vjj47vpd28", "5il79e11628"];

    if(formCategory && mayNegtive.includes(formCategory)){
      return <InputNumber  step={100}/>
    }

    return <InputNumber min={1} step={100}/>
  }

  return (
    <div className={prefix}>
      <div className="header">
        {
          !categoriesLoaded &&
          <Papaparser
            fileName={categoryFileName}
            setFileName={setCategoryFileName}
            title='Click to upload Categories CSV file'
            onFileLoaded={handleCategories}
          />
        }
        {
          !billLoaded &&
          <Papaparser
            fileName={billFileName}
            setFileName={setBillFileName}
            title='Click to upload Bill CSV file'
            onFileLoaded={handleBill}
          />
        }
        {
          categoriesLoaded && billLoaded &&
          <div className='selector'>
            {
              years && years.length > 0 &&
              <Select
                placeholder='Select Year'
                style={{ width: 'auto', minWidth: '100px' }}
                onChange={(value: number) => {
                  setYearSelected(value);
                  setMonthSelected(0);
                }}
                value={yearSelected}
              >
                {
                  years.map((year: number) => (<Option key={year} value={year}>{year}</Option>))
                }
              </Select>
            }
            {
              yearSelected && months && months[yearSelected] && [...months[yearSelected].values()].length > 0 &&
              <Select
                placeholder='Select Month'
                style={{ width: 'auto', minWidth: '100px' }}
                onChange={(value: number) => setMonthSelected(value)}
                value={monthSelected}
              >
                {
                  [...months[yearSelected].values()].map((month: number) => (<Option key={month} value={month}>{month === 0 ? 'None' : month}</Option>))
                }
              </Select>
            }
          </div>
        }
        {
          categoriesLoaded && billLoaded &&
          <Button onClick={() => setShowAddModal(true)} type="primary">Add a row</Button>
        }
      </div>
      <div className="content">
        {
          categoriesLoaded && billLoaded &&
          <Table
            columns={tableColumns}
            dataSource={tableData}
            rowKey={'id'}
            pagination={false}
            scroll={{y: `${document.body.clientHeight- 100}px`}}
            style={{
              width: '100%',
            }}
          />
        }
      </div>
      {
        showAddModal&&
        <Modal
          title="Add a row"
          visible={true}
          onOk={handleAddModal}
          onCancel={() => setShowAddModal(false)}
        >
          <Form
            {...layout}
            name="basic"
            form={form}
          >
            <Form.Item
              label="Time"
              name="time"
              rules={[{ required: true, message: 'Please choose time!' }]}
            >
              <DatePicker showTime />
            </Form.Item>
            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: 'Please choose category!' }]}
            >
              <Select onChange={(value: string) => setFormCategory(value)}>
                {originCategories.map((item) => <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item
              label="Amount"
              name="amount"
              rules={[{ required: true, message: 'Please input amount!' }]}
            >
              {getInput()}
            </Form.Item>
          </Form>
        </Modal>
      }
    </div>
  );
}

export default App;
