import React, { useState } from 'react';
import { Table } from 'antd';
import { prefix } from '.';
import Papaparser from '../PapaParser';
import { IParseResult, ICategories, ICategory, IBill, IBillItem } from '../types';
import { parseMilisecond } from '../utils';

function App() {
  const [originCategories, setOriginCategories] = useState<ICategory[]>([]);
  const [categories, setCategories] = useState<ICategories>({});
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  console.info('categories', categories)
  const [bill, setBill] = useState<IBill>([]);
  const [billLoaded, setBillLoaded] = useState(false);
  console.info('bill', bill)

  const [categoryFileName, setCategoryFileName] = useState<string>('');
  const [billFileName, setBillFileName] = useState<string>('');

  const handleCategories = (params: IParseResult) => {
    // console.info('Categories', params)
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
        alert(`This is not categories.csv, please choose categories.csv`);
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
    } else {
      console.error('handleCategories errors', errors)
    }
  }

  const handleBill = (params: IParseResult) => {
    // console.info('bill', params)
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
        alert(`This is not bill.csv, please choose bill.csv`);
        setBillFileName('');
        return;
      }

      let newData: IBill = [];
      data.forEach(item => {
        const newTime = item.time - 0;
        return newData.push({
          type: item.type - 0,
          category: item.category,
          time: newTime,
          amount: item.amount - 0,
          ...parseMilisecond(newTime),
        })
      })

      setBill(newData);
      setBillLoaded(true);
    } else {
      console.error('handleBill errors', errors)
    }
  }

  const getTableColumns = () => {
    let columns: ICategory[] = [
      {
        title: '日期',
        dataIndex: 'date',
      }
    ];

    originCategories.forEach((item: ICategory) => columns.push({
      title: item.name,
      dataIndex: item.id,
    }));

    return columns;
  }

  const getTableData = () => {
    let dataMap = new Map<string, any>();
    bill.forEach((item: IBillItem) => {
      if(!dataMap.get(item.fullString)){
        dataMap.set(item.fullString, {
          date: item.fullString,
          [item.category]: item.amount,
          year: item.year,
          month: item.month,
          day: item.date,
        })
      } else {
        dataMap.set(item.fullString, {
          ...dataMap.get(item.fullString),
          [item.category]: item.amount
        })
      }
    });

    let newData = [...dataMap.values()];
    console.info('newData', newData)

    return newData.sort((a, b) => (a.year - b.year) || (a.month - b.month) || (a.day - b.day) );
  }

  return (
    <div className={prefix}>
      <div className="header">
        <Papaparser
          fileName={categoryFileName}
          setFileName={setCategoryFileName}
          title='Click to parse Categories CSV file'
          onFileLoaded={handleCategories}
        />
        <Papaparser
          fileName={billFileName}
          setFileName={setBillFileName}
          title='Click to parse Bill CSV file'
          onFileLoaded={handleBill}
        />
      </div>
      <div className="content">
        {
          categoriesLoaded && billLoaded &&
          <Table
            columns={getTableColumns()}
            dataSource={getTableData()}
            rowKey={'index'}
            pagination={false}
            style={{
              width: '100%',
            }}
          />
        }
      </div>
    </div>
  );
}

export default App;
