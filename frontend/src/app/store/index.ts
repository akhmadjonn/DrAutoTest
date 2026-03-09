import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { authReducer, AuthState } from './auth/auth.reducer';
import { examReducer, ExamState } from './exam/exam.reducer';

export interface AppState {
  auth: AuthState;
  exam: ExamState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  exam: examReducer,
};

export const metaReducers: MetaReducer<AppState>[] = [];
