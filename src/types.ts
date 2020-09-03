import { ParseResult } from 'papaparse';

export type ICategory = {[index: string]: any}

export interface ICategories {
  [index: string]: ICategory;
}

export type IBillItem = {[index: string]: any};

export type IBill = IBillItem[];

export type IMeta = {fields: string[]};

export type IParseResult = ParseResult<{[index: string]: any}>;

export interface IPapaparserProps {
  fileName?: string;
  setFileName?: Function;
  title?: string;
  onFileLoaded?: (params: IParseResult) => void;
}