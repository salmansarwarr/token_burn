# Promo Code System Documentation

## Overview

The promo code system allows administrators to import, manage, and distribute promotional codes that users can redeem by burning tokens. Codes are securely stored using SHA256 hashing and AES-256 encryption, ensuring plain text codes are never stored in the database.

## Security Model

### Storage Architecture

1. **Hash (SHA256)**: Used for uniqueness checks and duplicate detection
    - Stored in `code_hash` column with unique index
    - Deterministic - same code always produces same hash
    - Used to prevent duplicate imports

2. **Encryption (AES-256-CBC)**: Used for code retrieval
    - Stored in `encrypted_code` column
    - Non-deterministic - includes random IV (Initialization Vector)
    - Allows decryption when code needs to be revealed to user

3. **Plain Text**: Never stored
    - Only exists during import and redemption
    - Revealed once to user upon successful redemption
    - Cannot be retrieved from database after import

### Encryption Key Management

The encryption key is derived from the `SESSION_SECRET` environment variable using SHA256 hashing. This ensures:

- 32-byte key length required for AES-256
- Consistent key derivation
- Single secret to manage

**Important**: Keep your `SESSION_SECRET` secure and backed up. Loss of this secret means encrypted codes cannot be decrypted.

## CSV Import Format

### Basic Format

The CSV file supports both simple and advanced formats:

#### Simple Format (Backward Compatible)

```csv
code,expiresAt
PROMO2024,2024-12-31T23:59:59Z
WELCOME50,
SAVE20,2024-06-30T23:59:59Z
```

#### Advanced Format (Recommended)

```csv
code,expiresAt,maxUses,campaign
PROMO2024,2024-12-31T23:59:59Z,1,holiday_2024
WELCOME50,,5,onboarding
SAVE20,2024-06-30T23:59:59Z,10,summer_sale
MULTI100,,100,loyalty_program
```

### Column Specifications

| Column      | Required | Type              | Description                 | Example                |
| ----------- | -------- | ----------------- | --------------------------- | ---------------------- |
| `code`      | ✅ Yes   | String            | The promotional code        | `WELCOME50`            |
| `expiresAt` | ❌ No    | ISO 8601 DateTime | Expiration date/time        | `2024-12-31T23:59:59Z` |
| `maxUses`   | ❌ No    | Integer (≥1)      | Maximum redemptions allowed | `5`                    |
| `campaign`  | ❌ No    | String            | Campaign identifier         | `summer_sale`          |

### Field Details

#### `code` (Required)

- Any alphanumeric string
- Case-sensitive
- Must be unique across all imports
- Whitespace is trimmed
- Recommended: 6-20 characters, uppercase with numbers

#### `expiresAt` (Optional)

- ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`
- UTC timezone recommended
- Leave empty for codes that never expire
- Codes with past dates are imported but marked as `EXPIRED`
- You'll receive a warning for expired codes

#### `maxUses` (Optional)

- Positive integer (1 or greater)
- Default: `1` (single-use code)
- `1` = Single-use code (most common)
- `>1` = Multi-use code (e.g., `5` allows 5 redemptions)
- Unlimited uses not supported (set a high number like `10000` if needed)

#### `campaign` (Optional)

- String identifier for grouping codes
- Use for tracking and filtering
- Examples: `holiday_2024`, `influencer_promo`, `loyalty_tier_gold`
- Can be overridden during upload via form parameter
- Leave empty if not using campaigns

### File Requirements

- **Encoding**: UTF-8
- **Line Endings**: Unix (LF) or Windows (CRLF) both supported
- **Header Row**: Optional (will be auto-detected if first line starts with "code")
- **Empty Lines**: Ignored
- **File Extension**: `.csv`

### Example CSV Files

#### Example 1: Simple Single-Use Codes

```csv
code
FIRST100
SECOND100
THIRD100
```

#### Example 2: Codes with Expiration

```csv
code,expiresAt
NEWYEAR2024,2024-01-31T23:59:59Z
VALENTINE,2024-02-14T23:59:59Z
SPRING,2024-05-31T23:59:59Z
```

#### Example 3: Multi-Use Campaign Codes

```csv
code,expiresAt,maxUses,campaign
INFLUENCER_JOHN,2024-12-31T23:59:59Z,50,influencer_q4
INFLUENCER_JANE,2024-12-31T23:59:59Z,100,influencer_q4
PODCAST_SPECIAL,,25,podcast_promo
```

## Import Process

### Step-by-Step

1. **Prepare CSV File**
    - Create CSV following format above
    - Validate all dates are in ISO 8601 format
    - Ensure codes are unique

2. **Upload via Admin Panel**
    - Navigate to admin promo code management
    - Select CSV file
    - (Optional) Enter campaign name to override CSV campaign column
    - Click Upload

3. **Processing**
    - Each code is hashed (SHA256) for duplicate detection
    - Each code is encrypted (AES-256) for secure storage
    - Expired codes are flagged with warnings
    - Duplicates are skipped (not imported)

4. **Results**
    - `imported`: Number of successfully imported codes
    - `duplicates`: Number of codes skipped (already exist)
    - `expired`: Number of codes that are already expired
    - `warnings`: Array of warning messages
    - `batchId`: UUID for this import batch

### Validation Rules

During import, the following validations are applied:

✅ **Accepted:**

- Valid code format (non-empty string)
- Future expiration dates
- Past expiration dates (imported as EXPIRED with warning)
- maxUses ≥ 1
- Any campaign string

❌ **Rejected:**

- Empty code field
- Duplicate codes (same hash exists)
- Invalid date formats
- maxUses < 1 or non-numeric

### Duplicate Handling

**Detection**: Duplicates are detected using SHA256 hash of the code.

**Behavior**:

- Duplicate codes are **skipped** (not imported)
- Original code remains unchanged
- Duplicate count is incremented
- No error is thrown (graceful handling)

**Example**:

```
Import 1: WELCOME50 → Imported ✅
Import 2: WELCOME50 → Skipped (duplicate) ⚠️
Result: 1 imported, 1 duplicate
```

### Expired Code Handling

**Detection**: Codes with `expiresAt` in the past are flagged.

**Behavior**:

- Expired codes **are imported** into the database
- Status is set to `EXPIRED` instead of `AVAILABLE`
- Warning message is added to response
- Cannot be redeemed

**Example**:

```csv
code,expiresAt
OLDCODE,2020-01-01T00:00:00Z
```

Result: Imported with status=EXPIRED, warning: "Code \"OLDCODE...\" is already expired"

**Rationale**: Allows historical tracking and prevents accidental deletion of expired codes.

## Code Usage & Redemption

### Single-Use Codes

**Configuration**: `maxUses = 1` (default)

**Lifecycle**:

1. Import: `status = AVAILABLE`, `usedCount = 0`
2. First Redemption: `status = REDEEMED`, `usedCount = 1`
3. Further Attempts: Rejected (no available codes)

**Use Cases**:

- One-time promotional offers
- Unique referral codes
- Limited edition rewards

### Multi-Use Codes

**Configuration**: `maxUses > 1` (e.g., 5, 10, 100)

**Lifecycle**:

1. Import: `status = AVAILABLE`, `usedCount = 0`, `maxUses = N`
2. Redemption 1: `status = AVAILABLE`, `usedCount = 1`
3. Redemption 2: `status = AVAILABLE`, `usedCount = 2`
4. ...
5. Redemption N: `status = REDEEMED`, `usedCount = N`
6. Further Attempts: Rejected (fully used)

**Use Cases**:

- Influencer codes (e.g., 50 uses)
- Community codes (e.g., 100 uses)
- Loyalty program codes
- Podcast/media partnership codes

### Status Transitions

```
AVAILABLE → REDEEMED (single-use: usedCount reaches maxUses)
AVAILABLE → AVAILABLE (multi-use: usedCount < maxUses)
AVAILABLE → EXPIRED (expiration date passes)
EXPIRED → (no transitions, terminal state)
REDEEMED → (no transitions, terminal state)
```

### Active/Inactive Flag

Administrators can disable codes without deleting them:

- `isActive = true`: Code can be redeemed (default)
- `isActive = false`: Code cannot be redeemed (disabled)

**Use Cases**:

- Temporarily pause a campaign
- Disable problematic codes
- Seasonal activation/deactivation

**Note**: Inactive codes are not returned during allocation, even if `status = AVAILABLE`.

## Campaign Management

### Purpose

Campaigns allow grouping and tracking codes by marketing initiative, partner, or time period.

### Setting Campaign

**Option 1: CSV Column**

```csv
code,expiresAt,maxUses,campaign
CODE1,,,summer_sale
CODE2,,,summer_sale
```

**Option 2: Upload Form Parameter**

- Override all codes in upload with single campaign
- Useful for bulk imports without editing CSV

**Option 3: Mixed**

- Form parameter takes precedence
- If form campaign is empty, CSV campaign is used

### Filtering by Campaign

**API Endpoint**: `GET /api/admin/promo-codes/inventory?campaign=summer_sale`

**Returns**: Statistics filtered to that campaign only

### Best Practices

- Use consistent naming: `lowercase_with_underscores`
- Include time period: `holiday_2024`, `q1_2024`
- Include partner/source: `influencer_john`, `podcast_xyz`
- Keep names descriptive: `loyalty_tier_gold` vs `ltg`

## API Reference

### Upload Codes

**Endpoint**: `POST /api/admin/promo-codes/upload`

**Authentication**: Admin session required

**Request**:

```typescript
FormData {
  file: File (CSV)
  campaign?: string (optional override)
}
```

**Response**:

```typescript
{
  success: boolean
  imported: number
  duplicates: number
  expired: number
  warnings: string[]
  batchId: string (UUID)
}
```

**Example**:

```json
{
    "success": true,
    "imported": 95,
    "duplicates": 3,
    "expired": 2,
    "warnings": [
        "Code \"OLDCODE1...\" is already expired",
        "Code \"OLDCODE2...\" is already expired"
    ],
    "batchId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Get Inventory

**Endpoint**: `GET /api/admin/promo-codes/inventory`

**Authentication**: Admin session required

**Query Parameters**:

- `campaign` (optional): Filter by campaign
- `batchId` (optional): Filter by import batch

**Response**:

```typescript
{
    available: number; // Codes ready to redeem
    allocated: number; // Codes in allocation process (legacy)
    redeemed: number; // Fully used codes
    expired: number; // Past expiration date
    total: number; // All codes
    active: number; // isActive = true
    inactive: number; // isActive = false
    singleUse: number; // maxUses = 1
    multiUse: number; // maxUses > 1
    totalUses: number; // Sum of all usedCount
    averageUsesPerCode: string; // totalUses / total (2 decimals)
}
```

**Example**:

```json
{
    "available": 450,
    "allocated": 0,
    "redeemed": 50,
    "expired": 10,
    "total": 510,
    "active": 500,
    "inactive": 10,
    "singleUse": 400,
    "multiUse": 110,
    "totalUses": 75,
    "averageUsesPerCode": "0.15"
}
```

## Database Schema

### `promo_codes` Table

| Column           | Type            | Description                              |
| ---------------- | --------------- | ---------------------------------------- |
| `id`             | String (CUID)   | Primary key                              |
| `code_hash`      | String (SHA256) | Unique hash for duplicate detection      |
| `encrypted_code` | String          | AES-256 encrypted code (IV:ciphertext)   |
| `status`         | Enum            | AVAILABLE, ALLOCATED, REDEEMED, EXPIRED  |
| `max_uses`       | Integer         | Maximum redemptions allowed (default: 1) |
| `used_count`     | Integer         | Current redemption count (default: 0)    |
| `campaign`       | String?         | Optional campaign identifier             |
| `is_active`      | Boolean         | Enable/disable flag (default: true)      |
| `expires_at`     | DateTime?       | Optional expiration timestamp            |
| `created_at`     | DateTime        | Import timestamp                         |
| `batch_id`       | String?         | Import batch UUID                        |

**Indexes**:

- `code_hash` (unique)
- `status`
- `batch_id`
- `campaign`
- `is_active`

### `redemptions` Table

| Column           | Type          | Description                    |
| ---------------- | ------------- | ------------------------------ |
| `id`             | String (CUID) | Primary key                    |
| `wallet_address` | String        | User's wallet (lowercase)      |
| `tx_hash`        | String        | Burn transaction hash (unique) |
| `burn_amount`    | String        | Amount of tokens burned        |
| `promo_code_id`  | String        | Foreign key to promo_codes     |
| `created_at`     | DateTime      | Redemption timestamp           |

**Indexes**:

- `wallet_address`
- `tx_hash` (unique)
- `created_at`

## Troubleshooting

### Import Issues

**Problem**: "No valid codes found in CSV"

- **Cause**: Empty file or all rows invalid
- **Solution**: Ensure at least one row has a non-empty code field

**Problem**: High duplicate count

- **Cause**: Codes already imported in previous batch
- **Solution**: Check existing codes, use new codes, or delete old batch first

**Problem**: All codes marked as expired

- **Cause**: `expiresAt` dates are in the past
- **Solution**: Update dates to future, or accept as historical import

### Redemption Issues

**Problem**: "No promo codes available"

- **Cause**: All codes used, expired, or inactive
- **Solution**: Import new codes or check inventory status

**Problem**: Multi-use code not working after first use

- **Cause**: Status incorrectly set to REDEEMED
- **Solution**: Check `usedCount` vs `maxUses` in database

### Security Issues

**Problem**: Cannot decrypt codes

- **Cause**: `SESSION_SECRET` changed or lost
- **Solution**: Restore original `SESSION_SECRET` from backup

**Problem**: Codes visible in database

- **Cause**: Misconfiguration (should not happen)
- **Solution**: Verify `encrypted_code` format is `IV:ciphertext`, not plain text

## Best Practices

### Code Generation

1. **Use strong, random codes**: `crypto.randomBytes(8).toString('hex').toUpperCase()`
2. **Avoid sequential patterns**: Not CODE1, CODE2, CODE3
3. **Include checksums**: For validation (optional)
4. **Length**: 8-16 characters for balance of security and usability

### Campaign Planning

1. **Plan campaigns in advance**: Define maxUses based on expected reach
2. **Use descriptive names**: Future you will thank you
3. **Set expiration dates**: Prevent indefinite code usage
4. **Monitor usage**: Check inventory regularly

### Security

1. **Backup SESSION_SECRET**: Store securely, encrypted backups
2. **Limit admin access**: Only trusted users should import codes
3. **Audit logs**: Review regularly for suspicious activity
4. **Rotate codes**: Expire and replace codes periodically

### Performance

1. **Batch imports**: Import in batches of 1000-10000 codes
2. **Use campaigns**: For easier filtering and reporting
3. **Clean up expired codes**: Archive or delete old expired codes
4. **Index optimization**: Ensure database indexes are maintained

## FAQ

**Q: Can I edit a code after import?**
A: No. Codes are hashed and cannot be changed. You can disable with `isActive = false` or delete and re-import.

**Q: Can I see the plain text code in the database?**
A: No. Only the hash and encrypted version are stored. Plain text is only revealed upon redemption.

**Q: What happens if I lose my SESSION_SECRET?**
A: Encrypted codes cannot be decrypted. You'll need to delete all codes and re-import with new codes.

**Q: Can I have unlimited use codes?**
A: Set `maxUses` to a very high number (e.g., 999999). True unlimited is not supported.

**Q: How do I delete a batch of codes?**
A: Use the `batchId` to filter and delete: `DELETE FROM promo_codes WHERE batch_id = 'xxx'`

**Q: Can users redeem multiple codes?**
A: Yes, if you have multiple available codes. Each redemption consumes one code or one use of a multi-use code.

**Q: What's the difference between ALLOCATED and REDEEMED?**
A: ALLOCATED is a legacy status. REDEEMED means the code has reached `maxUses` and cannot be used again.

## Support

For issues or questions:

1. Check this documentation
2. Review audit logs for detailed error information
3. Inspect database directly with Prisma Studio: `npm run db:studio`
4. Check application logs for error details
