import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { QuestionService } from '../../../core/services/question.service';
import { Question } from '../../../core/models/question.model';
import { QuestionCardComponent, QuestionAnswer } from '../../../shared/components/question-card/question-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-question-practice',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    QuestionCardComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './question-practice.component.html',
  styles: [`
    .practice-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 32px 16px;
    }
    .practice-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .practice-header h2 {
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
    }
    .practice-stats {
      display: flex;
      gap: 16px;
      font-size: 0.9rem;
      color: #666;
    }
    .stat-chip {
      padding: 6px 14px;
      border-radius: 20px;
      background: #f5f5f5;
      font-weight: 500;
    }
    .stat-chip.correct { background: #e8f5e9; color: #2e7d32; }
    .stat-chip.wrong { background: #ffebee; color: #c62828; }
    .actions-row {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      gap: 12px;
    }
    .feedback-box {
      margin-top: 16px;
      padding: 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .feedback-correct {
      background: #e8f5e9;
      border: 1px solid #a5d6a7;
    }
    .feedback-wrong {
      background: #ffebee;
      border: 1px solid #ef9a9a;
    }
    .feedback-box mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .feedback-box h4 { font-weight: 600; margin-bottom: 4px; }
    .feedback-box p { font-size: 0.9rem; color: #555; }
  `],
})
export class QuestionPracticeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private questionService = inject(QuestionService);
  private snackBar = inject(MatSnackBar);

  categoryId: string = '';
  currentQuestion: Question | null = null;
  selectedAnswerId: string | null = null;
  showResult = false;
  isCorrect = false;
  isLoading = true;

  totalAnswered = 0;
  correctCount = 0;
  wrongCount = 0;

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('categoryId') || '';
    this.loadNextQuestion();
  }

  loadNextQuestion(): void {
    this.isLoading = true;
    this.selectedAnswerId = null;
    this.showResult = false;
    this.isCorrect = false;

    this.questionService.getRandomQuestion(this.categoryId).subscribe({
      next: (res) => {
        if (res.success) {
          this.currentQuestion = res.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to load question', 'Close', { duration: 3000 });
      },
    });
  }

  onAnswerSelected(answerId: string): void {
    if (this.showResult || !this.currentQuestion) return;

    this.selectedAnswerId = answerId;
    this.showResult = true;
    this.totalAnswered++;

    const selectedAnswer = this.currentQuestion.answers.find((a) => a.id === answerId);
    this.isCorrect = selectedAnswer?.isCorrect || false;

    if (this.isCorrect) {
      this.correctCount++;
    } else {
      this.wrongCount++;
    }
  }

  getAnswers(): QuestionAnswer[] {
    if (!this.currentQuestion) return [];
    return this.currentQuestion.answers.map((a) => ({
      id: a.id,
      text: a.text,
      isCorrect: a.isCorrect,
    }));
  }

  getAccuracy(): number {
    if (this.totalAnswered === 0) return 0;
    return Math.round((this.correctCount / this.totalAnswered) * 100);
  }
}
