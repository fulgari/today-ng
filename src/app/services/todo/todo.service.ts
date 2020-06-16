import { Injectable } from '@angular/core';
import { Todo } from 'src/app/pages/main/domain/entities';
import { Subject } from 'rxjs';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { TODOS } from '../local-storage/local-storage.namespace';
import { ListService } from '../list/list.service';
import { ONE_HOUR, floorToMinute, getCurrentTime } from 'src/app/utils/time';

type SpecialListUUID = 'today' | 'todo'; // Type alias -- 该类型用来限定传入的值：只能取这两个值

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  private todos: Todo[] = [];
  todo$ = new Subject<Todo[]>();

  constructor(
    private listService: ListService,
    private store: LocalStorageService
  ) { }

  // 广播
  private broadCast(): void {
    this.todo$.next(this.todos);
  }

  // 保存在LocalStorageService中的持久化对象（相当于model）
  private persist(): void {
    this.store.set(TODOS, this.todos);
  }

  getAll(): void {
    this.todos = this.store.getList(TODOS);
    this.broadCast();
  }
  
  getRaw(): Todo[] {
    return this.todos;
  }

  getByUUID(uuid: string): Todo | null {
    return this.todos.filter((todo: Todo) => todo._id === uuid)[0] || null;
  } 

  // 设为今日
  setTodoToday(uuid: string): void {
    const todo = this.getByUUID(uuid);
    if(todo && !todo.completedFlag) {
      todo.planAt = floorToMinute(new Date()) + ONE_HOUR;
      this.update(todo);
    }
  }

  toggleTodoComplete(uuid: string) :void {
    const todo = this.getByUUID(uuid);
    if(todo) {
      todo.completedFlag = !todo.completedFlag;
      todo.completedAt = todo.completedFlag ? getCurrentTime() : undefined;
      this.persist();
    }
  }

  // 移到别的List
  moveToList(uuid: string, listUUID: string): void {
    const todo = this.getByUUID(uuid);
    if(todo) {
      todo.listUUID = listUUID;
      this.update(todo);
    }
  }


  add(title: string): void {
    const listUUID = this.listService.getCurrentListUuid();
    const newTodo = new Todo(title, listUUID);

    // 只有Today这个List中的Todo才有planAt的初始值，其他List里的新todo都是没有的
    if(listUUID === 'today') {
      newTodo.planAt = floorToMinute(new Date()) + ONE_HOUR; //因为要给下一个制定的Todo计划预留一个1h的空挡
      newTodo.listUUID = 'todo'
    }

    this.todos.push(newTodo);
    this.broadCast();
    this.persist();
  }

  update(todo: Todo): void {
    const index = this.todos.findIndex(t => t._id === todo._id);
    if(index !== -1) {
      todo.completedAt = todo.completedFlag ? getCurrentTime() : undefined;
      this.todos.splice(index, 1, todo);
    }
  }

  delete(uuid: string): void {
    const i = this.todos.findIndex(t => t._id === uuid);
    if(i !== -1) {
      this.todos.splice(i, 1);
      this.broadCast();
      this.persist();
    }
  }

  deleteInList(uuid: string): void {
    const toDelete = this.todos.filter(t => t.listUUID === uuid);
    toDelete.forEach(t => this.delete(t._id));
  }
  
}