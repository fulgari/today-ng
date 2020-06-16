import { Component, OnInit, Input } from '@angular/core';
import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';
import { USERNAME } from 'src/app/services/local-storage/local-storage.namespace';

@Component({
  selector: 'app-left-control',
  templateUrl: './left-control.component.html',
  styleUrls: ['./left-control.component.scss']
})
export class LeftControlComponent implements OnInit {
  @Input() isCollapsed: boolean;

  username: string;

  constructor(
    private store: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.username = this.store.get(USERNAME);
  }

}
