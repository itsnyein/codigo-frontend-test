import {
  combineSlices,
  configureStore,
  createListenerMiddleware,
} from "@reduxjs/toolkit";
import { hydrationSlice } from "./hydration";
import { statePersistence, type PersistedState } from "./persisted-state";

const rootReducer = combineSlices(hydrationSlice);

export type RootState = ReturnType<typeof rootReducer>;

const PERSISTED_SLICE_KEYS: readonly (keyof RootState)[] = [];

function selectPersistedState(state: RootState): PersistedState {
  return Object.fromEntries(
    PERSISTED_SLICE_KEYS.map((key) => [key, state[key]]),
  ) as PersistedState;
}

function hasPersistedChange(current: RootState, previous: RootState): boolean {
  return PERSISTED_SLICE_KEYS.some((key) => current[key] !== previous[key]);
}

export const makeStore = () => {
  const listenerMiddleware = createListenerMiddleware<RootState>();

  listenerMiddleware.startListening({
    predicate: (_action, currentState, previousState) =>
      hasPersistedChange(currentState, previousState),
    effect: (_action, listenerApi) => {
      statePersistence.save(selectPersistedState(listenerApi.getState()));
    },
  });

  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
