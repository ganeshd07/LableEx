import { createReducer,  on} from '@ngrx/store';
import * as AppState from './app.state';

export const appFeatureKey = 'app';
export const initialState = AppState;

export const AppReducer = createReducer(
  initialState,
);
