"use client";

import { useRef, useSyncExternalStore } from "react";
import { Provider } from "react-redux";
import { persistStore, type Persistor } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { makeStore, type AppStore } from "./index";

// false on the server and during hydration, true once we're in the browser
const subscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(subscribe, () => true, () => false);

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const isClient = useIsClient();
  const storeRef = useRef<AppStore | null>(null);
  const persistorRef = useRef<Persistor | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
    persistorRef.current = persistStore(storeRef.current);
  }

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistorRef.current!}>
        {isClient ? children : null}
      </PersistGate>
    </Provider>
  );
}