import React from 'react';
import Papaparse from 'papaparse';
import { message, Button, Input } from 'antd';
import { IPapaparserProps, IParseResult } from '../types';
import { prefix } from '.';

const CSVParser = (props: IPapaparserProps) => {
  const {
    title = 'Click to upload CSV file',
    onFileLoaded = () => {},
    fileName = '',
    setFileName = () => {},
  } = props || {}

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files: FileList | null = event.target.files;
    if(files && files[0]){
      setFileName(files[0].name)
      const reader = new FileReader();
      reader.readAsText(files[0]);
      reader.onload = loadHandler;
      reader.onerror = errorHandler;
    }
  }

  const parseString = (dataString: string) => {
    const csv: IParseResult = Papaparse.parse(dataString, {
      header: true,
    });

    onFileLoaded(csv);
  }

  const loadHandler = (res: any) => {
    const {
      readyState,
      result,
    } = res.target || {}

    if(readyState === 2){
      parseString(result);
    }
  }

  const errorHandler = (evt: any) => {
    if(evt.target.error.name === "NotReadableError") {
      message.error("Canno't read file !");
    }
  }

  return (
    <Button className={prefix} type="primary">
      {fileName ? fileName : title}
      <Input
        type="file"
        onChange={handleFile}
        accept=".csv"
        className='inputFile'
      />
    </Button>
  )

}

export default CSVParser;