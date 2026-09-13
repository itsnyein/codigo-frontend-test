import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { rehydrated } from "@/store/persisted-state";

export interface AuthState {
  username: string | null;
}

const initialState: AuthState = { username: null };

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loggedIn(state, action: PayloadAction<string>) {
      state.username = action.payload.trim();
    },
    loggedOut(state) {
      state.username = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(rehydrated, (state, action) => {
      state.username = action.payload.auth?.username ?? null;
    });
  },
  selectors: {
    selectUsername: (state) => state.username,
    selectIsSignedIn: (state) => state.username !== null,
  },
});

export const { loggedIn, loggedOut } = authSlice.actions;
export const { selectUsername, selectIsSignedIn } = authSlice.selectors;
