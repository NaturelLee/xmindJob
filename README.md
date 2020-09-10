# Xmind Job Application

## How to use
This project is deployed on [Github pages](https://naturellee.github.io/xmindJob/)

```shell
# In xmindJob dir
# nodejs and npm should be installed first!
# If not goto https://nodejs.org/

# If yarn is not installed, excute commands below:

npm install yarn -g

# Install dependencies

yarn

# Start the app

yarn start

```

Click the buttons to upload CSV files to parse.
![bill parsed](https://github.com/NaturelLee/xmindJob/blob/master/public/bill_parsed.png)

## Thoughts of Implementation

### 1. Download CSV Files From Github;
### 2. Read CSV File
In order to show the csv data as table; I need to read the csv file;
There are several ways to impliment the app; server based or just the web app; It's possible to make a web app for the request; so I decided to read the file with **FileReader** and **input** element.
### 3. Parse CSV File
First thought is to search for npm pkg on npmjs.org to parse csv files; I got **papaparse** and **react-papaparse**; As I decided to use react, react version is the first choice. But the result parsed with it is not good and is complicated to manage. So I chose **papaparse** and made a simple component with it.
### 4. Store data
There are to csv files to form into one complete table. Table header and actual data in it. As table record is in
```js
const record = {
  name: 'Jim',
  age: 25,
  city: '',
}
```
format; name/age/city are just id in the categories.csv file; so the id is the key to connect the two files together. Origin data parsed from csv files are stored in order to add new data and new formated ones with more fields are stored for easy use.

### 5. Show the data
There are many categories but the data to show with each category may not exit, this makes the table a little empty. Select a year and one month, the table show all data in the selected month with the first row of summation of the month; The outcomes and incomes are shown on the most right two sides. In order to sort the outcomes, the categories must change from the amount value and the negtive ones also needed to be considered. If someone add new data, the year may change. So the months exist must also connected to the year selected. I got this format

```ts
const yearMonth: {[index: string]: Set<number>} = {}
```
the first value is **0** in order not to select the month;

