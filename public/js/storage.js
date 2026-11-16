import { sanitizeState } from './domain.js';
export const STORAGE_KEY='senda:portfolio:v1';
export function readState(storage){try{return sanitizeState(JSON.parse(storage.getItem(STORAGE_KEY)||'{}'));}catch{return sanitizeState({});}}
export function writeState(storage,state){try{storage.setItem(STORAGE_KEY,JSON.stringify(sanitizeState(state)));return true;}catch{return false;}}
export function getStorage(){try{return window.localStorage;}catch{return {getItem(){return null;},setItem(){throw Error('Storage disabled');},removeItem(){}};}}

