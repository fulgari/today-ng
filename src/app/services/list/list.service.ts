import { Injectable } from '@angular/core';
import { List } from 'src/app/pages/main/domain/entities';
import { Subject } from 'rxjs';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { LISTS } from '../local-storage/local-storage.namespace';

// 系统给定的两个List，固定在上面。因此给他们分配特殊的uuid：'today' | 'todo'
type SpecialListUUID = 'today' | 'todo'; // Type alias -- 该类型用来限定传入的值：只能取这两个值

@Injectable({
  providedIn: 'root'
})
export class ListService {

  private current: List;
  private lists: List[] = [];
  // currentUuid的类型要么是SpecialListUUID，要么是string。默认取值为SpecialListUUID中的'today'
  currentUuid: SpecialListUUID | string = 'today'; 

  // 下面带dollar号的是异步对象Subject，它可以是观察者，也可以是被观察者。
  currentUuid$ = new Subject<string>();
  current$ = new Subject<List>();
  lists$ = new Subject<List[]>();


  constructor(
    private store: LocalStorageService
  ) { }

  // 广播
  // Subject能够成为流的源头，通过next方法源源不断地向订阅它的（一个或多个）观察者发送值。
  private broadCast(): void {
    this.lists$.next(this.lists);
    this.current$.next(this.current);
    this.currentUuid$.next(this.currentUuid);
  }

  // 保存在LocalStorageService中的持久化对象（相当于model）
  private persist(): void {
    this.store.set(LISTS, this.lists);
  }

  private getByUuid(uuid: string): List {
    return this.lists.find(l => l._id === uuid);
  }

  private update(list: List): void {
    const index = this.lists.findIndex(l => l._id === list._id);
    if(index === -1) {
      this.lists.splice(index, 1, list);
      this.persist();
      this.broadCast();
    }
  }

  getCurrentListUuid(): SpecialListUUID | string {
    return this.currentUuid;
  }

  setCurrentListUuid(uuid: string): void {
    this.currentUuid = uuid;
    this.current = this.lists.find(l => l._id === uuid);
    this.broadCast();
  }

  getAll(): void {
    this.lists = this.store.getList(LISTS);
    this.broadCast();
  }

  add(title: string): void {
    const newList = new List(title); 
    this.lists.push(newList);
    this.currentUuid = newList._id;
    this.current = newList;

    this.broadCast();
    this.persist();
  }

  rename(listUuid: string, title: string): void {
    const list = this.getByUuid(listUuid);
    if(list) {
      list.title = title;
      this.update(list);
    }
  }

  delete(uuid: string): void {
    const i = this.lists.findIndex(l => l._id === uuid);
    if(i !== -1) {
      this.lists.splice(i, 1);
      // 删除List的时候，要考虑当前的所focus的List在哪：
      // 如果还有别的自定义的List，就focus到最后一个List
      // 如果当前在Today，就保持
      // 否则就focus在TODO
      this.currentUuid = this.lists.length ? this.lists[this.lists.length - 1]._id : this.currentUuid === 'today' ? 'today' : 'todo';
      this.broadCast();
      this.persist();
    }
  }
  
}
