# Security Specification & Threat Model (TDD) for WrapStock

## 1. Data Invariants

- **User Profiles**: Only authenticated users with verified emails may create their user profiles. Users cannot assign themselves the `admin` role upon creation, nor can they elevate their own roles after creation. Role modification is strictly restricted to existing administrators.
- **Inventory Access**: Only authenticated personnel holding the `admin` or `staff` role can read or write inventory records. Items must possess a non-empty name, positive price details, non-negative quantities, and a structured barcode.
- **KPDN Price Ceilings**: Only administrators (`role == 'admin'`) can create, update, or delete ceiling prices. Staff can only read them.
- **System Settings**: A user may only see and update their own preference settings (locale/theme).
- **Notifications**: System-triggered alerts can be edited (marked as read) by employees of the cooperative, but deleted only by administrators.
- **Reports**: AI reports can only be generated or read by employees, with deletion restricted strictly to administrators.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following 12 attack payloads are designed to challenge and break the identity, integrity, and permissions structure of the application. The Firestore security rules must block them successfully, returning `PERMISSION_DENIED`.

### Attack 1: Self-Privilege Escalation during Registration
- **Target Collection**: `/users/attacker_uid`
- **Description**: An attacker tries to register as an administrator during profile creation.
- **Payload**:
  ```json
  {
    "uid": "attacker_uid",
    "email": "attacker@gmail.com",
    "role": "admin",
    "createdAt": "2026-06-06T10:00:00Z"
  }
  ```
  *Expectation: Blocked. User is not an admin, so they cannot assign their own role as 'admin'.*

### Attack 2: Impersonation / Identity Spoofing of Another User Profile
- **Target Collection**: `/users/other_user_uid`
- **Description**: Attacker tries to write over another user's profile metadata.
- **Payload**:
  ```json
  {
    "uid": "other_user_uid",
    "email": "victim@gmail.com",
    "role": "staff"
  }
  ```
  *Expectation: Blocked. `request.auth.uid` does not match path variable `other_user_uid`.*

### Attack 3: Shadow Key Injection into Inventory (Ghost Field)
- **Target Collection**: `/inventory/item_123`
- **Description**: Attacker tries to inject an unauthorized boolean or backdoor field `isApproved` inside an inventory item.
- **Payload**:
  ```json
  {
    "name": "Milo 1kg",
    "barcode": "9556001091234",
    "category": "Drinks",
    "quantity": 100,
    "unitPrice": 12.50,
    "sellingPrice": 15.00,
    "expiryDate": "2026-09-12",
    "isApproved": true
  }
  ```
  *Expectation: Blocked. Validation helper blocks any extra, non-blueprint fields.*

### Attack 4: Denial of Wallet via massive ID Poisoning
- **Target Collection**: `/inventory/JUNK_CHARACTERS_THAT_ARE_1KB_LONG_@@@!!!`
- **Description**: Accessing or creating an item with an extremely long invalid-character ID to exhaust rule database resources.
- **Payload**:
  ```json
  {
    "name": "Bread",
    "barcode": "0000",
    "category": "Food",
    "quantity": 10,
    "unitPrice": 2.00,
    "sellingPrice": 2.50,
    "expiryDate": "2026-06-15"
  }
  ```
  *Expectation: Blocked. Document ID fails pattern validation matching regex `^[a-zA-Z0-9_\-]+$` and length boundaries.*

### Attack 5: Price Ceiling Bypass on Controlled Items (KPDN Overwrite)
- **Target Collection**: `/kpdn_prices/gula`
- **Description**: A staff member or non-admin attempts to maliciously alter the KPDN ceiling price of Gula to mask an illegal price hike.
- **Payload**:
  ```json
  {
    "product": "Gula",
    "maxPrice": 10.00
  }
  ```
  *Expectation: Blocked. Only administrators can write to the `/kpdn_prices` collection.*

### Attack 6: Unsigned Request Query Scraping
- **Target Collection**: `/inventory`
- **Description**: Unauthenticated user attempts to poll all active inventory listings of the cooperative store.
- **Payload**: `GET /inventory`
  *Expectation: Blocked. Read permission requires a valid active session with verified email and staff/admin role.*

### Attack 7: Fake System-Generated Report Injection
- **Target Collection**: `/reports/fake_report_777`
- **Description**: A staff member or user attempts to inject a fraudulent inventory audit report.
- **Payload**:
  ```json
  {
    "title": "Faked Security Audit",
    "summary": "Everything is fine.",
    "fastMoving": ["malicious_link"],
    "generatedAt": "2020-01-01T00:00:00Z"
  }
  ```
  *Expectation: Blocked. Only administrative accounts or authorized services can publish reports, and timeline stamps must match server time.*

### Attack 8: Mutating Timestamp Fields ('createdAt' Tampering)
- **Target Collection**: `/inventory/item_123`
- **Description**: User tries to change `createdAt` of a product to retroactively manipulate logging audits.
- **Payload**: Updating `createdAt` from original value `2026-01-01` to `2025-01-01`.
  *Expectation: Blocked. `createdAt` must be immutable during document updates.*

### Attack 9: Setting Unbounded Malicious Arrays (Resource Exhaustion)
- **Target Collection**: `/reports/report_456`
- **Description**: Attacker sets an arrays with 10,000 strings inside `fastMoving` list to balloon document sizes.
- **Payload**: Array size exceeds safety boundary limits (e.g. maximum 50 elements allowed).
  *Expectation: Blocked. Array length boundaries are strictly restricted to 50 items.*

### Attack 10: State Shifting Bypass (Staff Deleting Inventory logs)
- **Target Collection**: `/inventory/item_456`
- **Description**: A user with only a `staff` role tries to delete a high-value product to steal from store stock without a audit log.
- **Payload**: `DELETE /inventory/item_456`
  *Expectation: Blocked. Delete requires administrative credentials.*

### Attack 11: Cross-User Settings Overwrite
- **Target Collection**: `/settings/victim_user_id`
- **Description**: Authenticated attacker tries to change the active UI language or theme settings of another account.
- **Payload**:
  ```json
  {
    "language": "ms",
    "mode": "dark"
  }
  ```
  *Expectation: Blocked. Document path key does not match request.auth.uid.*

### Attack 12: Infiltrating with Unverified Email Signatures
- **Target Collection**: `/inventory/item_789`
- **Description**: Attacker with a self-registered, unverified fake email domain attempts to insert products.
- **Payload**: Attempting a write action with `email_verified == false`.
  *Expectation: Blocked. Write gates strictly require certified verification tokens.*

---

## 3. The Test Cases Draft Blueprint (TDD Approach)

To guide construction and testing:

```typescript
// firestore.rules.test.ts (Draft representation)
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";

// The test runner would instantiate scenarios confirming:
// 1. assertFails(createUserProfileWithAdminRole(userAuth));
// 2. assertFails(accessPrivateProfileAsPeer(hackerAuth, victimUid));
// 3. assertFails(insertInventoryWithGhostFields(staffAuth, payloadWithApprovedFlag));
// 4. assertFails(mutateCeilingPriceAsStaff(staffAuth, sugarLimitPayload));
// 5. assertSucceeds(readInventoryAsStaff(staffAuth));
```
