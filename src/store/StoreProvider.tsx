"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { hydrationFinished } from "./hydration";
import { makeStore } from "./index";
import { rehydrated, statePersistence } from "./persisted-state";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);

  // Reading localStorage during render would make the server and client trees
  // disagree, so persisted state is applied after mount and gated on
  // `selectIsHydrated`.
  useEffect(() => {
    const persisted = statePersistence.load();
    if (persisted) store.dispatch(rehydrated(persisted));
    store.dispatch(hydrationFinished());
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
