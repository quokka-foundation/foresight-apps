// ============================================================
// Foresight — Bitquery GraphQL Client
// ============================================================
// Polls the Bitquery EAP endpoint for Base network data.
// Used exclusively in server-side cron routes — never in the browser.

import { BITQUERY_API_URL, CLANKER_FACTORY } from "./constants";

// ── Response Types ────────────────────────────────────────────────────────────

export interface BitqueryTrade {
  Trade: {
    Buyer: string;
    Seller: string;
    Amount: number;
    AmountInUSD: number;
    Currency: {
      SmartContract: string;
      Symbol: string;
      Name: string;
    };
  };
  Block: {
    Number: number;
    Time: string;
  };
  Transaction: {
    Hash: string;
  };
}

export interface BitqueryPoolEvent {
  Log: {
    SmartContract: string;
    Signature: { Name: string };
  };
  Arguments: {
    Name: string;
    Value: { address?: string; bigInteger?: string };
  }[];
  Block: { Time: string; Number: number };
  Transaction: { Hash: string };
}

export interface BitqueryClankerLaunch {
  Arguments: {
    Name: string;
    Value: { address?: string; string?: string };
  }[];
  Block: { Time: string; Number: number };
  Transaction: { Hash: string };
}

export interface BitqueryTokenMetrics {
  Trade: {
    Currency: {
      SmartContract: string;
      Symbol: string;
      Name: string;
    };
    PriceInUSD: number;
  };
  volumeUSD: number;
  tradeCount: number;
}

// ── Core Fetch Helper ─────────────────────────────────────────────────────────

async function bitqueryFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const apiKey = process.env.BITQUERY_API_KEY;
  if (!apiKey) throw new Error("BITQUERY_API_KEY is not set");

  const res = await fetch(BITQUERY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Bitquery request failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };

  if (json.errors?.length) {
    throw new Error(`Bitquery GraphQL error: ${json.errors[0].message}`);
  }

  if (!json.data) throw new Error("Bitquery returned no data");
  return json.data;
}

// ── Queries ───────────────────────────────────────────────────────────────────

const RECENT_TRADES_QUERY = `
  query RecentTrades($since: DateTime!) {
    EVM(network: base) {
      DEXTrades(
        where: {
          Block: { Time: { after: $since } }
          Trade: { AmountInUSD: { ge: "1000" } }
        }
        orderBy: { descending: Block_Time }
        limit: { count: 500 }
      ) {
        Trade {
          Buyer
          Seller
          Amount
          AmountInUSD
          Currency {
            SmartContract
            Symbol
            Name
          }
        }
        Block { Number Time }
        Transaction { Hash }
      }
    }
  }
`;

const NEW_POOLS_QUERY = `
  query NewPools($since: DateTime!, $factory: String!) {
    EVM(network: base) {
      Events(
        where: {
          Log: {
            SmartContract: { is: $factory }
            Signature: { Name: { is: "PoolCreated" } }
          }
          Block: { Time: { after: $since } }
        }
        orderBy: { descending: Block_Time }
        limit: { count: 50 }
      ) {
        Log { SmartContract Signature { Name } }
        Arguments {
          Name
          Value {
            ... on EVM_ABI_Address_Value_Arg { address }
            ... on EVM_ABI_Integer_Value_Arg { bigInteger }
          }
        }
        Block { Time Number }
        Transaction { Hash }
      }
    }
  }
`;

const CLANKER_LAUNCHES_QUERY = `
  query ClankerLaunches($since: DateTime!, $factory: String!) {
    EVM(network: base) {
      Events(
        where: {
          Log: {
            SmartContract: { is: $factory }
            Signature: { Name: { is: "TokenCreated" } }
          }
          Block: { Time: { after: $since } }
        }
        orderBy: { descending: Block_Time }
        limit: { count: 50 }
      ) {
        Arguments {
          Name
          Value {
            ... on EVM_ABI_Address_Value_Arg { address }
            ... on EVM_ABI_String_Value_Arg  { string }
          }
        }
        Block { Time Number }
        Transaction { Hash }
      }
    }
  }
`;

const TOKEN_PRICES_QUERY = `
  query TokenPrices($addresses: [String!]!, $since: DateTime!) {
    EVM(network: base) {
      DEXTrades(
        where: {
          Trade: { Currency: { SmartContract: { in: $addresses } } }
          Block: { Time: { after: $since } }
        }
        orderBy: { descending: Block_Time }
        limit: { count: 1, by: Trade_Currency_SmartContract }
      ) {
        Trade {
          Currency { SmartContract Symbol Name }
          PriceInUSD
        }
      }
    }
  }
`;

const TOP_TOKENS_QUERY = `
  query TopTokens($since: DateTime!) {
    EVM(network: base) {
      DEXTrades(
        where: {
          Block: { Time: { after: $since } }
          Trade: { AmountInUSD: { ge: "100" } }
        }
        groupBy: [Trade_Currency_SmartContract]
        orderBy: { descendingByField: "volumeUSD" }
        limit: { count: 30 }
      ) {
        Trade {
          Currency { SmartContract Symbol Name }
          PriceInUSD
        }
        volumeUSD: sum(of: Trade_AmountInUSD)
        tradeCount: count
      }
    }
  }
`;

const WALLET_TRADES_QUERY = `
  query WalletTrades($address: String!, $since: DateTime!) {
    EVM(network: base) {
      DEXTrades(
        where: {
          any: [
            { Trade: { Buyer: { is: $address } } }
            { Trade: { Seller: { is: $address } } }
          ]
          Block: { Time: { after: $since } }
        }
        orderBy: { descending: Block_Time }
        limit: { count: 200 }
      ) {
        Trade {
          Buyer
          Seller
          Amount
          AmountInUSD
          Currency { SmartContract Symbol }
        }
        Block { Number Time }
        Transaction { Hash }
      }
    }
  }
`;

// ── Public API ────────────────────────────────────────────────────────────────

function sinceIso(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

/**
 * Fetch DEX trades on Base in the last `sinceMinutes` minutes.
 * Returns trades with value >= $1,000.
 */
export async function fetchRecentTrades(sinceMinutes = 5): Promise<BitqueryTrade[]> {
  type Resp = { EVM: { DEXTrades: BitqueryTrade[] } };
  const data = await bitqueryFetch<Resp>(RECENT_TRADES_QUERY, {
    since: sinceIso(sinceMinutes),
  });
  return data.EVM.DEXTrades ?? [];
}

/**
 * Fetch new Aerodrome / Uniswap pool creation events on Base.
 */
export async function fetchNewPools(
  sinceMinutes = 10,
  factoryAddress = "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
): Promise<BitqueryPoolEvent[]> {
  type Resp = { EVM: { Events: BitqueryPoolEvent[] } };
  const data = await bitqueryFetch<Resp>(NEW_POOLS_QUERY, {
    since: sinceIso(sinceMinutes),
    factory: factoryAddress,
  });
  return data.EVM.Events ?? [];
}

/**
 * Fetch Clanker-deployed token launches on Base.
 */
export async function fetchClankerLaunches(sinceMinutes = 10): Promise<BitqueryClankerLaunch[]> {
  type Resp = { EVM: { Events: BitqueryClankerLaunch[] } };
  const data = await bitqueryFetch<Resp>(CLANKER_LAUNCHES_QUERY, {
    since: sinceIso(sinceMinutes),
    factory: CLANKER_FACTORY,
  });
  return data.EVM.Events ?? [];
}

/**
 * Fetch the latest trade price for a list of token addresses.
 * Returns a map of lowercase address → priceUSD.
 */
export async function fetchTokenPrices(addresses: string[]): Promise<Map<string, number>> {
  if (!addresses.length) return new Map();
  type Resp = {
    EVM: { DEXTrades: { Trade: { Currency: { SmartContract: string }; PriceInUSD: number } }[] };
  };
  const data = await bitqueryFetch<Resp>(TOKEN_PRICES_QUERY, {
    addresses: addresses.map((a) => a.toLowerCase()),
    since: sinceIso(5),
  });
  const map = new Map<string, number>();
  for (const row of data.EVM.DEXTrades ?? []) {
    map.set(row.Trade.Currency.SmartContract.toLowerCase(), row.Trade.PriceInUSD);
  }
  return map;
}

/**
 * Fetch top tokens by volume in the last 24h (for the ticker bar and token list).
 */
export async function fetchTopTokens(): Promise<BitqueryTokenMetrics[]> {
  type Resp = { EVM: { DEXTrades: BitqueryTokenMetrics[] } };
  const data = await bitqueryFetch<Resp>(TOP_TOKENS_QUERY, {
    since: sinceIso(24 * 60),
  });
  return data.EVM.DEXTrades ?? [];
}

/**
 * Fetch all trades by a specific wallet in the last `sinceDays` days.
 */
export async function fetchWalletTrades(address: string, sinceDays = 30): Promise<BitqueryTrade[]> {
  type Resp = { EVM: { DEXTrades: BitqueryTrade[] } };
  const data = await bitqueryFetch<Resp>(WALLET_TRADES_QUERY, {
    address: address.toLowerCase(),
    since: sinceIso(sinceDays * 24 * 60),
  });
  return data.EVM.DEXTrades ?? [];
}
