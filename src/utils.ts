import moment from 'moment';
import Constants from './Constants';

export const parseMilisecond = (time: number) => {
  const offset = moment().utcOffset();
  const date = moment(time).utcOffset(offset);
  return {
    date: date.date(),
    month: date.month() + 1,
    year: date.year(),
    fullString: date.format(Constants.YMD),
  }
}