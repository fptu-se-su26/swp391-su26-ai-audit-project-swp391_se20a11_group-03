"use client";

import { getAuctionState, AuctionState } from "./auctionService";

/**
 * Singleton polling module. Polls `/api/auctions/{id}/state` every 2s for each
 * registered auctionId and dispatches a custom event so subscribed React
 * components re-render with the latest snapshot.
 *
 * Pattern modeled after `src/lib/watchlist.ts`.
 */

const POLL_INTERVAL_MS = 1_000;
const AUCTION_TICK_EVENT = "auction:tick";

type Listener = (state: AuctionState) => void;

const stateCache = new Map<number, AuctionState>();
const listenersByAuction = new Map<number, Set<Listener>>();
const intervalsByAuction = new Map<number, ReturnType<typeof setInterval>>();

function notify(auctionId: number) {
  const state = stateCache.get(auctionId);
  const set = listenersByAuction.get(auctionId);
  if (!state || !set) return;
  set.forEach((listener) => {
    try {
      listener(state);
    } catch (err) {
      console.error("auctionPolling listener error", err);
    }
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(AUCTION_TICK_EVENT, { detail: { auctionId, state } }),
    );
  }
}

async function pollOnce(auctionId: number) {
  try {
    const fresh = await getAuctionState(auctionId);
    stateCache.set(auctionId, fresh);
    notify(auctionId);
  } catch (err) {
    // Silent — polling will retry next tick
    console.debug(`auctionPolling poll failed for ${auctionId}`, err);
  }
}

export function getCachedAuctionState(auctionId: number): AuctionState | undefined {
  return stateCache.get(auctionId);
}

export function subscribeAuction(auctionId: number, listener: Listener): () => void {
  if (!listenersByAuction.has(auctionId)) listenersByAuction.set(auctionId, new Set());
  listenersByAuction.get(auctionId)!.add(listener);

  // Start polling on first subscriber
  if (!intervalsByAuction.has(auctionId)) {
    pollOnce(auctionId);
    const handle = setInterval(() => pollOnce(auctionId), POLL_INTERVAL_MS);
    intervalsByAuction.set(auctionId, handle);
  }

  return () => {
    const set = listenersByAuction.get(auctionId);
    if (set) {
      set.delete(listener);
      if (set.size === 0) {
        const handle = intervalsByAuction.get(auctionId);
        if (handle) clearInterval(handle);
        intervalsByAuction.delete(auctionId);
        listenersByAuction.delete(auctionId);
        stateCache.delete(auctionId);
      }
    }
  };
}

export function forceRefresh(auctionId: number) {
  return pollOnce(auctionId);
}
