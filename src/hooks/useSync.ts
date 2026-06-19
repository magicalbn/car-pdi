"use client";

import { useEffect, useState } from "react";
import { getSyncState, subscribeSync } from "@/lib/sync/syncEngine";

export function useSync() {
  const [state, setState] = useState(getSyncState());
  useEffect(() => subscribeSync(setState), []);
  return state;
}
