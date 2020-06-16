import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgZorroAntdModule, NZ_I18N, en_US, NzIconModule } from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { SetupModule } from './pages/setup/setup.module';
import { LocalStorageService } from './services/local-storage/local-storage.service';
import { MainModule } from './pages/main/main.module';
import { MainRoutingRoutingModule } from './pages/main/main-routing-routing.module';
import { ListService } from './services/list/list.service';
import { TodoService } from './services/todo/todo.service';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgZorroAntdModule,
    SetupModule,
    MainModule,
    MainRoutingRoutingModule,
    NzIconModule 
  ],
  providers: [
    { provide: NZ_I18N, useValue: en_US }, 
    LocalStorageService, 
    ListService, 
    TodoService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
