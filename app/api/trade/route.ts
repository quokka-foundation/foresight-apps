import { NextRequest, NextResponse } from 'next/server';
import { IS_DEMO } from '@/lib/constants';
import { getMarketById } from '@/lib/mock-data';
import { calculatePayout } from '@/lib/curve-math';

export const runtime = 'edge';

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message, support: 'https://x.com/foresight' },
    { status }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { marketId, probability, amount, leverage, direction } = body;

    if (!marketId || probability == null || !amount) {
      return errorResponse(
        'Missing required fields: marketId, probability, amount',
        400
      );
    }

    if (probability <= 0 || probability >= 100) {
      return errorResponse('Probability must be between 0 and 100', 400);
    }

    if (amount <= 0 || amount > 10_000) {
      return errorResponse('Amount must be between $1 and $10,000', 400);
    }

    const market = getMarketById(marketId);
    if (!market) {
      return errorResponse('Market not found', 404);
    }

    if (market.status !== 'active') {
      return errorResponse('Market is not active', 400);
    }

    const lev = leverage || 1;
    const dir = direction || 'yes';
    const potentialPayout = calculatePayout(amount, probability, lev);

    if (IS_DEMO) {
      // Demo mode: return simulated trade result
      const hash = `0x${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;

      return NextResponse.json({
        success: true,
        demo: true,
        trade: {
          hash,
          tradeId: Math.floor(Math.random() * 100000),
          marketId,
          direction: dir,
          amount,
          leverage: lev,
          entryProbability: probability,
          potentialPayout: parseFloat(potentialPayout.toFixed(2)),
          gasUsed: 0.15,
          timestamp: Date.now(),
        },
      });
    }

    // Live mode: construct eth_sendTransaction payload
    return NextResponse.json({
      success: true,
      demo: false,
      tx: {
        to: process.env.NEXT_PUBLIC_FORESIGHT_MARKET_ADDRESS,
        data: '0x', // Encoded contract call placeholder
        value: '0',
      },
    });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
