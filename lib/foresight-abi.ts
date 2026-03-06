// ========================================
// Foresight Mini App — Contract ABI
// ========================================
// Placeholder ABI for the Foresight Continuous Outcome Market contract.
// Replace with generated ABI from foresight-core when contract is deployed.

export const FORESIGHT_MARKET_ABI = [
  {
    type: 'function',
    name: 'tradeCurve',
    inputs: [
      { name: 'probability', type: 'uint256', internalType: 'uint256' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      { name: 'leverage', type: 'uint256', internalType: 'uint256' },
      { name: 'direction', type: 'bool', internalType: 'bool' },
    ],
    outputs: [
      { name: 'tradeId', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'getMarketData',
    inputs: [
      { name: 'marketId', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [
      { name: 'probability', type: 'uint256', internalType: 'uint256' },
      { name: 'volume', type: 'uint256', internalType: 'uint256' },
      { name: 'liquidity', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPosition',
    inputs: [
      { name: 'positionId', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      { name: 'owner', type: 'address', internalType: 'address' },
      { name: 'probability', type: 'uint256', internalType: 'uint256' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      { name: 'leverage', type: 'uint256', internalType: 'uint256' },
      { name: 'direction', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'closePosition',
    inputs: [
      { name: 'positionId', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      { name: 'payout', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getCurveHistory',
    inputs: [
      { name: 'marketId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'fromTimestamp', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      { name: 'timestamps', type: 'uint256[]', internalType: 'uint256[]' },
      { name: 'probabilities', type: 'uint256[]', internalType: 'uint256[]' },
      { name: 'volumes', type: 'uint256[]', internalType: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'TradeExecuted',
    inputs: [
      { name: 'trader', type: 'address', indexed: true, internalType: 'address' },
      { name: 'marketId', type: 'bytes32', indexed: true, internalType: 'bytes32' },
      { name: 'tradeId', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'probability', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'leverage', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'PositionClosed',
    inputs: [
      { name: 'owner', type: 'address', indexed: true, internalType: 'address' },
      { name: 'positionId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'payout', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
] as const;

// USDC on Base
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;

// Foresight Market contract — set via env after deployment
export const FORESIGHT_MARKET_ADDRESS = (
  process.env.NEXT_PUBLIC_FORESIGHT_MARKET_ADDRESS ??
  '0x0000000000000000000000000000000000000000'
) as `0x${string}`;
