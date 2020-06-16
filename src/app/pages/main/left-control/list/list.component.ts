import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { NzDropdownMenuComponent, NzModalService, NzContextMenuService } from 'ng-zorro-antd';
import { List } from '../../domain/entities';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ListService } from 'src/app/services/list/list.service';
import { TodoService } from 'src/app/services/todo/todo.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  @Input() isCollapsed: boolean;
  @ViewChild('listRenameInput') private listRenameInput: ElementRef;
  @ViewChild('listInput') private listInput: ElementRef;

  lists: List[];
  currentListUuid: string;
  contextListUuid: string;
  addListModalVisible = false;
  renameListModalVisible = false;

  private destroy$ = new Subject();

  constructor(
    private nzContextMenuService: NzContextMenuService,
    private listService: ListService,
    private todoService: TodoService,
    private modal: NzModalService
  ) { }

  ngOnInit(): void {
    this.listService.lists$
      .pipe(takeUntil(this.destroy$)) //等到整个list页面初始化加载完了，再取lists（异步进行，提高渲染效率?）
      .subscribe(lists => {
        this.lists = lists;
      });

    this.listService.currentUuid$
      .pipe(takeUntil(this.destroy$))
      .subscribe(uuid => {
        this.currentListUuid = uuid;
      }); // Observable.subscribe(Observer); 这句话可以这样理解：（从右往左看）观察者，订阅了，一个可以观察的对象。

    this.listService.getAll(); //也有可能是防止getAll()的时候出错了
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  closeAddListModal(): void {
    this.addListModalVisible = false;
  }
  closeRenameListModal(): void {
    this.renameListModalVisible = false;
  }

  openAddListModal(): void {
    this.addListModalVisible = true;
    setTimeout(()=>{
      this.listInput.nativeElement.focus();
    });
  }

  openRenameListModal(): void {
    this.renameListModalVisible = true;
    setTimeout(()=>{
      const title = this.lists.find(l => l._id === this.contextListUuid).title;
      console.log(title);
      this.listRenameInput.nativeElement.value = title;
      this.listRenameInput.nativeElement.focus();
    });
  }

  contextmenu($event: MouseEvent, menu: NzDropdownMenuComponent, uuid: string): void{
    this.nzContextMenuService.create($event, menu);
    this.contextListUuid = uuid;
  }

  click(uuid: string): void {
    this.listService.setCurrentListUuid(uuid);
  }

  rename(title: string): void {
    this.listService.rename(this.contextListUuid, title);
    this.closeRenameListModal(); // 将rename的Medal消息框隐形
  }

  add(title: string): void {
    this.listService.add(title);
    this.closeAddListModal();
  }

  delete(): void {
    const uuid = this.contextListUuid;
    this.modal.confirm({
      nzTitle: 'Are you sure to delete this list?',
      nzContent: 'All Todos in this list will be deleted',
      nzOnOk: () => new Promise((res, rej) => {
        this.listService.delete(uuid);
        this.todoService.deleteInList(uuid);
        res();
      }).catch(() => console.error('Delete list failed'))
    });
  }

  close(): void {
    this.nzContextMenuService.close();
  }
}
