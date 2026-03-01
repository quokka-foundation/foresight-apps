# ABI Documentation

## ForesightVault (ERC-4626)

**Network:** Base Mainnet (chainId: 8453)
**Standard:** EIP-4626 Tokenized Vault

### Core Functions

#### `deposit(uint256 assets, address receiver) → uint256 shares`

Deposits `assets` amount of USDC into the vault and mints shares to `receiver`.

- `assets`: Amount in USDC (6 decimals). `100e6` = 100 USDC
- `receiver`: Address that receives vault shares
- Returns: Number of shares minted

#### `redeem(uint256 shares, address receiver, address owner) → uint256 assets`

Burns `shares` and returns USDC to `receiver`.

#### `previewRedeem(uint256 shares) → uint256 assets`

Returns estimated USDC for given shares at current exchange rate. Use for yield preview.

#### `previewDeposit(uint256 assets) → uint256 shares`

Returns estimated shares for given USDC deposit.

#### `totalAssets() → uint256`

Total USDC managed by vault.

#### `totalSupply() → uint256`

Total shares outstanding.

#### `balanceOf(address account) → uint256`

Share balance of an address.

### APY Calculation

```ts
const apy = ((totalAssets / totalSupply) ** 365 - 1) * 100
// Note: simplified — actual APY depends on vault strategy
```

### Events

| Event | When |
|-------|------|
| `Deposit(caller, owner, assets, shares)` | On deposit |
| `Withdraw(caller, receiver, owner, assets, shares)` | On redeem |
