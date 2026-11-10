# Security Specification

## 1. Data Invariants
- The ledger metadata path `/ledgers/{ledgerId}` stores metadata for the synchronized financial dataset.
- `ledgerId` must satisfy `isValidId(ledgerId)` (max 128 chars, alphanumeric + hyphens/underscores).
- Ledger metadata must contain valid strings for `lastUploadedAt` (ISO date string, max 64 chars) and `updatedAt`.
- The data chunks path `/ledgers/{ledgerId}/chunks/{chunkId}` stores chunked JSON payloads of invoices and payments to ensure atomic and quota-efficient synchronization.
- `chunkId` must satisfy `isValidId(chunkId)`.
- `chunkIndex` and `totalChunks` must be valid numbers >= 0.
- `dataType` must be either 'invoices', 'payments', or 'all'.
- `itemsJson` must be a valid string within 800,000 characters to protect against document size exhaustion.

## 2. The "Dirty Dozen" Payloads (Adversarial Security Test Vectors)
1. **Invalid ID Poisoning**: Document write to `/ledgers/invalid..id$$$/` with malformed path variable.
2. **Oversized String Bomb**: `itemsJson` exceeding 800,000 characters.
3. **Missing Required Field**: Metadata document missing `lastUploadedAt`.
4. **Invalid DataType**: `dataType` set to 'malicious_exec'.
5. **Negative Chunk Index**: `chunkIndex: -5`.
6. **Negative Count**: `count: -100`.
7. **Type Mismatch on totalInvoices**: `totalInvoices: "ten"`.
8. **Invalid Schema Injection**: Writing unapproved extra keys beyond allowed schema.
9. **Junk Character Ledger ID**: 1.5KB character string used as `ledgerId`.
10. **Unauthorized Global Collection Write**: Write attempt to root `/unknown_collection/hack`.
11. **Negative Total Chunks**: `totalChunks: -1`.
12. **Null Timestamp Write**: `updatedAt: null`.

## 3. Test Runner Invariant
All payloads above must evaluate to false or be blocked by security rules.
