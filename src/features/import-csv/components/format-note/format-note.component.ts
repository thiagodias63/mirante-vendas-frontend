import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-format-note',
  templateUrl: './format-note.component.html',
  styleUrls: ['./format-note.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormatNoteComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
