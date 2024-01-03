import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TextService } from '../../services/text.service';
import { Subscription } from 'rxjs';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatIconModule, MatButtonModule

  ],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.css'
})
export class TextInputComponent {
  value = '';
  private textSubscription!: Subscription
  private textService = inject(TextService);

  private tokenCreationService = inject(TokenService)

  ngOnInit() {

    this.textSubscription = this.textService.getText().subscribe(
      (text) => {
        this.value = text
      });
  }



  ngOnDestroy() {
    this.textSubscription?.unsubscribe();
  }

  updateTextService() {
    this.textService.setText(this.value);
  }

  clearInput() {
    this.value = '';
    this.textService.setText('');
  }

  sendTokenCreation() {
    this.tokenCreationService.setTokenCreationValue(true);
  }

}
