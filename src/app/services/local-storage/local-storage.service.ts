import { Injectable } from '@angular/core';

const ls = localStorage;

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  public get<T>(key: string): any {
    return JSON.parse(ls.getItem(key)) as T;
  }

  public getList<T>(key: string) {
    const before = ls.getItem(key);
    return before ? (JSON.parse(before) as T[]) : [];
  }

  // 本地存储中，是通过键值对来进行保存的。
  // key已经先行在local-storage.namespace中定义好了
  // 对每个键，我们都有一个数组用来存储
  public set(key: string, value: any): void {
    if(!value && value === undefined) {
      return;
    }
    const arr = JSON.stringify(value);
    ls.setItem(key, arr);
  }
}
