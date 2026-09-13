import {
  combineSlices,
  configureStore,
  createListenerMiddleware,
} from "@reduxjs/toolkit";
import { authSlice } from "@/features/auth/authSlice";
import { playersSlice } from "@/features/players/playersSlice";
import { teamsSlice } from "@/features/teams/teamsSlice";
import { hydrationSlice } from "./hydration";
import { statePersistence, type PersistedState } from "./persisted-state";

const rootReducer = combineSlices(hydrationSlice, authSlice, teamsSlice, playersSlice);

export type RootState = ReturnType<typeof rootReducer>;

const PERSISTED_SLICE_KEYS: readonly (keyof RootState)[] = ["auth", "teams"];

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
