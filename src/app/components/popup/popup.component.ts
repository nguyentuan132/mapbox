import { Component, OnInit, Inject } from '@angular/core';
import { MapboxService } from '../../services/mapbox.service';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {

  constructor(private mapboxService: MapboxService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.mapboxService.currentLocalSource.subscribe(
      location => {
        console.log("location", location);
        if (location) {
          this.openDialog(location);
        }
      }
    );
  }

  openDialog(location) {
    const dialogRef = this.dialog.open(DialogContent, {
      data: location
    });
  }
}

@Component({
  selector: 'dialog-content',
  templateUrl: 'dialog-content.html',
})
export class DialogContent {
  constructor(
    public dialogRef: MatDialogRef<PopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log("location --- : ", data);
  }
  onCancelClick(): void {
    this.dialogRef.close();
  }

  round(n: number) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }
}