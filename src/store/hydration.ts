import { createSlice } from "@reduxjs/toolkit";

type HydrationStatus = "pending" | "ready";

interface HydrationState {
  status: HydrationStatus;
}

const initialState: HydrationState = { status: "pending" };

export const hydrationSlice = createSlice({
  name: "hydration",
  initialState,
  reducers: {
    hydrationFinished(state) {
      state.status = "ready";
    },
  },
  selectors: {
    selectIsHydrated: (state) => state.status === "ready",
  },
});

export const { hydrationFinished } = hydrationSlice.actions;
export const { selectIsHydrated } = hydrationSlice.selectors;
