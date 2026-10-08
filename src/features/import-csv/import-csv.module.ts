import { NgModule } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ImportCsvComponent } from './pages/import-csv.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProcessCsvService } from './core/service/process-csv.service';
import { ProcessDataSequential } from './core/strategies/process-data-sequential.service';
import { ProcessDataSimultaneously } from './core/strategies/process-data-simultaneously.service';
import { VendaService } from './core/api/venda.service';
import { ProcessDataFactory } from './core/factories/process-data.factory';
import { UploadCardComponent } from './components/upload-card/upload-card.component';
import { UploadAreaComponent } from './components/upload-area/upload-area.component';
import { ProcessingStateComponent } from './components/processing-state/processing-state.component';
import { SendAreaComponent } from './components/send-area/send-area.component';
import { FormatNoteComponent } from './components/format-note/format-note.component';
import { SharedModule } from 'primeng/api';

@NgModule({
  declarations: [
    ImportCsvComponent,
    UploadCardComponent,
    UploadAreaComponent,
    ProcessingStateComponent,
    SendAreaComponent,
    FormatNoteComponent,
  ],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ImportCsvComponent,
      },
    ]),
    CommonModule,
    FileUploadModule,
    ButtonModule,
    SkeletonModule,
    SelectButtonModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
  ],
  providers: [
    VendaService,
    ProcessDataSimultaneously,
    ProcessDataSequential,
    ProcessCsvService,
    ProcessDataFactory,
  ],
})
export class ImportCsvModule {}
