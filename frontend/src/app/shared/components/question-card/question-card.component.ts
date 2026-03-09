import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

export interface QuestionAnswer {
  id: string;
  text: string;
  isCorrect?: boolean;
}

@Component({
  selector: 'app-question-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatRadioModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './question-card.component.html',
  styles: [`
    .question-card {
      border-radius: 12px;
      overflow: hidden;
    }
    .question-image {
      width: 100%;
      max-height: 300px;
      object-fit: contain;
      border-radius: 8px;
      margin-bottom: 16px;
      background: #f5f5f5;
    }
    .question-text {
      font-size: 1.1rem;
      font-weight: 500;
      line-height: 1.6;
      margin-bottom: 20px;
      color: #333;
    }
    .answers-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .answer-option {
      padding: 14px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .answer-option:hover:not(.disabled) {
      border-color: #388e3c;
      background: #f1f8e9;
    }
    .answer-option.selected {
      border-color: #1976d2;
      background: #e3f2fd;
    }
    .answer-option.correct {
      border-color: #4caf50;
      background: #e8f5e9;
    }
    .answer-option.incorrect {
      border-color: #f44336;
      background: #ffebee;
    }
    .answer-option.disabled {
      cursor: default;
    }
    .answer-letter {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.85rem;
      background: #e0e0e0;
      color: #333;
      flex-shrink: 0;
    }
    .selected .answer-letter { background: #1976d2; color: white; }
    .correct .answer-letter { background: #4caf50; color: white; }
    .incorrect .answer-letter { background: #f44336; color: white; }
    .answer-text { flex: 1; font-size: 0.95rem; }
    .answer-icon { margin-left: auto; }
    .explanation-box {
      margin-top: 16px;
      padding: 16px;
      background: #fff8e1;
      border-left: 4px solid #ff9800;
      border-radius: 0 8px 8px 0;
    }
    .explanation-box h4 {
      margin: 0 0 8px;
      color: #e65100;
      font-size: 0.9rem;
    }
    .explanation-box p {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.5;
      color: #555;
    }
    .question-meta {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
  `],
})
export class QuestionCardComponent {
  @Input() questionNumber: number = 1;
  @Input() totalQuestions: number = 1;
  @Input() questionText: string = '';
  @Input() questionImage?: string;
  @Input() answers: QuestionAnswer[] = [];
  @Input() selectedAnswerId?: string;
  @Input() showResult: boolean = false;
  @Input() showExplanation: boolean = false;
  @Input() explanation?: string;
  @Input() categoryName?: string;
  @Input() disabled: boolean = false;

  @Output() answerSelected = new EventEmitter<string>();

  letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  selectAnswer(answerId: string): void {
    if (!this.disabled && !this.showResult) {
      this.answerSelected.emit(answerId);
    }
  }

  getAnswerClass(answer: QuestionAnswer): string {
    const classes: string[] = [];
    if (this.disabled) classes.push('disabled');
    if (this.selectedAnswerId === answer.id && !this.showResult) {
      classes.push('selected');
    }
    if (this.showResult) {
      if (answer.isCorrect) {
        classes.push('correct');
      } else if (this.selectedAnswerId === answer.id && !answer.isCorrect) {
        classes.push('incorrect');
      }
    }
    return classes.join(' ');
  }
}
