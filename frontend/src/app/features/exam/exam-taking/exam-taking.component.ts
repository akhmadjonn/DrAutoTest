import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { Store } from '@ngrx/store';
import { Subscription, interval } from 'rxjs';
import { AppState } from '../../../store';
import * as ExamActions from '../../../store/exam/exam.actions';
import * as ExamSelectors from '../../../store/exam/exam.selectors';
import { QuestionCardComponent } from '../../../shared/components/question-card/question-card.component';
import { TimerComponent } from '../../../shared/components/timer/timer.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-exam-taking',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDialogModule,
    MatChipsModule,
    QuestionCardComponent,
    TimerComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './exam-taking.component.html',
  styles: [`
    .exam-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 24px 16px;
    }
    .exam-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 16px;
      flex-wrap: wrap;
    }
    .exam-progress-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .progress-text {
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
    }
    .question-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      gap: 12px;
    }
    .nav-btn {
      min-width: 120px !important;
    }
    .question-grid {
      margin-top: 24px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .question-grid h3 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 12px;
      color: #333;
    }
    .grid-items {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .grid-item {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid #e0e0e0;
      background: white;
    }
    .grid-item:hover { border-color: #4caf50; }
    .grid-item.current { border-color: #1976d2; background: #e3f2fd; color: #1976d2; }
    .grid-item.answered { border-color: #4caf50; background: #e8f5e9; color: #2e7d32; }
    .grid-item.marked { border-color: #ff9800; background: #fff3e0; color: #e65100; }
    .grid-legend {
      display: flex;
      gap: 16px;
      margin-top: 12px;
      font-size: 0.8rem;
      color: #888;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }
    .action-btns {
      display: flex;
      gap: 8px;
    }
    @media (max-width: 640px) {
      .exam-header { flex-direction: column; align-items: stretch; }
      .question-nav { flex-direction: column; }
    }
  `],
})
export class ExamTakingComponent implements OnInit, OnDestroy {
  private store = inject(Store<AppState>);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  exam$ = this.store.select(ExamSelectors.selectCurrentExam);
  currentQuestion$ = this.store.select(ExamSelectors.selectCurrentQuestion);
  currentIndex$ = this.store.select(ExamSelectors.selectCurrentQuestionIndex);
  totalQuestions$ = this.store.select(ExamSelectors.selectTotalQuestions);
  answeredCount$ = this.store.select(ExamSelectors.selectAnsweredCount);
  progress$ = this.store.select(ExamSelectors.selectExamProgress);
  isLoading$ = this.store.select(ExamSelectors.selectIsLoading);
  isSubmitting$ = this.store.select(ExamSelectors.selectIsSubmitting);
  timeRemaining$ = this.store.select(ExamSelectors.selectTimeRemaining);

  private timerSub?: Subscription;

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('id');
    if (examId) {
      this.store.dispatch(ExamActions.loadExam({ examId }));
    }

    this.timerSub = interval(1000).subscribe(() => {
      this.store.dispatch(ExamActions.tickTimer());
    });
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }

  onAnswerSelected(answerId: string, examId: string, questionId: string): void {
    this.store.dispatch(
      ExamActions.submitAnswer({
        request: { examId, questionId, answerId },
      })
    );
  }

  onNavigate(index: number): void {
    this.store.dispatch(ExamActions.navigateToQuestion({ index }));
  }

  onPrevious(currentIndex: number): void {
    if (currentIndex > 0) {
      this.onNavigate(currentIndex - 1);
    }
  }

  onNext(currentIndex: number, total: number): void {
    if (currentIndex < total - 1) {
      this.onNavigate(currentIndex + 1);
    }
  }

  onMarkQuestion(examId: string, questionId: string): void {
    this.store.dispatch(ExamActions.markQuestion({ examId, questionId }));
  }

  onFinishExam(examId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Finish Exam?',
        message: 'Are you sure you want to finish the exam? You cannot change your answers after submitting.',
        confirmText: 'Finish Exam',
        cancelText: 'Continue',
        type: 'warning',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.store.dispatch(ExamActions.finishExam({ examId }));
      }
    });
  }

  onAbandonExam(examId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Abandon Exam?',
        message: 'Are you sure you want to abandon this exam? Your progress will be lost.',
        confirmText: 'Abandon',
        cancelText: 'Cancel',
        type: 'danger',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.store.dispatch(ExamActions.abandonExam({ examId }));
      }
    });
  }

  onTimeUp(examId: string): void {
    this.store.dispatch(ExamActions.finishExam({ examId }));
  }

  getGridItemClass(index: number, currentIndex: number, question: any): string {
    const classes: string[] = [];
    if (index === currentIndex) classes.push('current');
    if (question.isAnswered) classes.push('answered');
    if (question.isMarked) classes.push('marked');
    return classes.join(' ');
  }
}
