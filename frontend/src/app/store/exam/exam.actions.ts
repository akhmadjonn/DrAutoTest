import { createAction, props } from '@ngrx/store';
import { Exam, ExamResult, StartExamRequest, SubmitAnswerRequest } from '../../core/models/exam.model';

export const startExam = createAction('[Exam] Start Exam', props<{ request: StartExamRequest }>());
export const startExamSuccess = createAction('[Exam] Start Exam Success', props<{ exam: Exam }>());
export const startExamFailure = createAction('[Exam] Start Exam Failure', props<{ error: string }>());

export const loadExam = createAction('[Exam] Load Exam', props<{ examId: string }>());
export const loadExamSuccess = createAction('[Exam] Load Exam Success', props<{ exam: Exam }>());
export const loadExamFailure = createAction('[Exam] Load Exam Failure', props<{ error: string }>());

export const submitAnswer = createAction('[Exam] Submit Answer', props<{ request: SubmitAnswerRequest }>());
export const submitAnswerSuccess = createAction(
  '[Exam] Submit Answer Success',
  props<{ questionId: string; answerId: string; isCorrect: boolean; correctAnswerId: string }>()
);
export const submitAnswerFailure = createAction('[Exam] Submit Answer Failure', props<{ error: string }>());

export const navigateToQuestion = createAction('[Exam] Navigate To Question', props<{ index: number }>());

export const markQuestion = createAction('[Exam] Mark Question', props<{ examId: string; questionId: string }>());
export const markQuestionSuccess = createAction(
  '[Exam] Mark Question Success',
  props<{ questionId: string; marked: boolean }>()
);

export const finishExam = createAction('[Exam] Finish Exam', props<{ examId: string }>());
export const finishExamSuccess = createAction('[Exam] Finish Exam Success', props<{ result: ExamResult }>());
export const finishExamFailure = createAction('[Exam] Finish Exam Failure', props<{ error: string }>());

export const abandonExam = createAction('[Exam] Abandon Exam', props<{ examId: string }>());
export const abandonExamSuccess = createAction('[Exam] Abandon Exam Success');

export const clearExam = createAction('[Exam] Clear Exam');

export const tickTimer = createAction('[Exam] Tick Timer');
