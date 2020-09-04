import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('Papaparser render', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/Click to upload Bill CSV file/i);
  expect(linkElement).toBeInTheDocument();
  const categoriesElement = getByText(/Click to upload Categories CSV file/i);
  expect(categoriesElement).toBeInTheDocument();
});
