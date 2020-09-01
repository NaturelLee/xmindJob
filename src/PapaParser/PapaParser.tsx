import React from 'react';
import { CSVReader } from 'react-papaparse';

const CSV = () => {
  const handleOnDrop = (data: any) => {
    console.info('data', data)

  }
  const handleOnError = (err: any) => {
    console.log(err)
  }

  return (
    <CSVReader
      onDrop={handleOnDrop}
      onError={handleOnError}
    >
      Drop CSV file here or click to upload.
    </CSVReader>
  )
}

export default CSV;