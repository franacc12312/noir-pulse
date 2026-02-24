import { NextResponse } from "next/server";
import type { NetworkData } from "@/lib/types";

let cache: { data: NetworkData; timestamp: number } | null = null;
const CACHE_DURATION = 15_000; // 15 seconds

async function rpcCall(url: string, method: string): Promise<unknown> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params: [],
    }),
  });

  if (!res.ok) throw new Error(`RPC error: ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

export async function GET() {
  const nodeUrl = process.env.AZTEC_NODE_URL;

  if (!nodeUrl) {
    return NextResponse.json(
      {
        error: "not_configured",
        message: "AZTEC_NODE_URL not configured",
      },
      { status: 503 }
    );
  }

  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_DURATION) {
    return NextResponse.json(cache.data);
  }

  try {
    const [blockHeight, provenBlockHeight] = await Promise.all([
      rpcCall(nodeUrl, "node_getBlockNumber"),
      rpcCall(nodeUrl, "node_getProvenBlockNumber"),
    ]);

    const bh = typeof blockHeight === "number" ? blockHeight : Number(blockHeight);
    const pbh = typeof provenBlockHeight === "number" ? provenBlockHeight : Number(provenBlockHeight);

    const data: NetworkData = {
      blockHeight: bh,
      provenBlockHeight: pbh,
      finalityGap: bh - pbh,
      status: bh - pbh <= 5 ? "synced" : "syncing",
    };

    cache = { data, timestamp: now };
    return NextResponse.json(data);
  } catch (error) {
    if (cache) {
      return NextResponse.json(cache.data);
    }
    return NextResponse.json(
      {
        error: "rpc_error",
        message: error instanceof Error ? error.message : "RPC call failed",
        blockHeight: 0,
        provenBlockHeight: 0,
        finalityGap: 0,
        status: "unavailable" as const,
      },
      { status: 502 }
    );
  }
}
