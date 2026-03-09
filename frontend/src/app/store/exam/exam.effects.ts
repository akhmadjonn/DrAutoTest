import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap } from 'rxjs/operators';
import { ExamService } from '../../core/services/exam.service';
import * as ExamActions from './exam.actions';

@Injectable()
export class ExamEffects {
  startExam$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamActions.startExam),
      exhaustMap(({ request }) =>
        this.examService.startExam(request).pipe(
          map((res) => {
            if (res.success) {
              return ExamActions.startExamSuccess({ exam: res.data });
            }
            return ExamActions.startExamFailure({ error: res.message });
          }),
          catchError((error) =>
            of(ExamActions.startExamFailure({ error: error.error?.message || 'Failed to start exam' }))
          )
        )
      )
    )
  );

  startExamSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ExamActions.startExamSuccess),
        tap(({ exam }) => {
          this.router.navigate(['/exam/taking', exam.id]);
        })
      ),
    { dispatch: false }
  );

  loadExam$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamActions.loadExam),
      exhaustMap(({ examId }) =>
        this.examService.getExam(examId).pipe(
          map((res) => {
            if (res.success) {
              return ExamActions.loadExamSuccess({ exam: res.data });
            }
            return ExamActions.loadExamFailure({ error: res.message });
          }),
          catchError((error) =>
            of(ExamActions.loadExamFailure({ error: error.error?.message || 'Failed to load exam' }))
          )
        )
      )
    )
  );

  submitAnswer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamActions.submitAnswer),
      exhaustMap(({ request }) =>
        this.examService.submitAnswer(request).pipe(
          map((res) => {
            if (res.success) {
              return ExamActions.submitAnswerSuccess({
                questionId: request.questionId,
                answerId: request.answerId,
                isCorrect: res.data.isCorrect,
                correctAnswerId: res.data.correctAnswerId,
              });
            }
            return ExamActions.submitAnswerFailure({ error: res.message });
          }),
          catchError((error) =>
            of(ExamActions.submitAnswerFailure({ error: error.error?.message || 'Failed to submit answer' }))
          )
        )
      )
    )
  );

  markQuestion$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamActions.markQuestion),
      exhaustMap(({ examId, questionId }) =>
        this.examService.markQuestion(examId, questionId).pipe(
          map((res) => ExamActions.markQuestionSuccess({ questionId, marked: res.data.marked })),
          catchError(() => of(ExamActions.markQuestionSuccess({ questionId, marked: false })))
        )
      )
    )
  );

  finishExam$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamActions.finishExam),
      exhaustMap(({ examId }) =>
        this.examService.finishExam(examId).pipe(
          map((res) => {
            if (res.success) {
              return ExamActions.finishExamSuccess({ result: res.data });
            }
            return ExamActions.finishExamFailure({ error: res.message });
          }),
          catchError((error) =>
            of(ExamActions.finishExamFailure({ error: error.error?.message || 'Failed to finish exam' }))
          )
        )
      )
    )
  );

  finishExamSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ExamActions.finishExamSuccess),
        tap(({ result }) => {
          this.router.navigate(['/exam/result', result.exam.id]);
        })
      ),
    { dispatch: false }
  );

  abandonExam$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamActions.abandonExam),
      exhaustMap(({ examId }) =>
        this.examService.abandonExam(examId).pipe(
          map(() => ExamActions.abandonExamSuccess()),
          catchError(() => of(ExamActions.abandonExamSuccess()))
        )
      )
    )
  );

  abandonExamSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ExamActions.abandonExamSuccess),
        tap(() => {
          this.router.navigate(['/home/dashboard']);
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private examService: ExamService,
    private router: Router
  ) {}
}
