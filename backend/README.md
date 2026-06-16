# MoneyTrack API

Backend built with Express, Drizzle ORM, and PostgreSQL.

## Running

```bash
cd backend
docker compose up --build
```

API available at `http://localhost:3001`

---

## Authentication

Unprotected endpoints return a JWT token. All other endpoints require:

```
Authorization: Bearer <token>
```

---

## Endpoints

### Auth

#### Register
```
POST /api/auth/register
```
Body:
```json
{ "username": "john", "mail": "john@example.com", "password": "secret" }
```
Response `201`:
```json
{ "token": "<jwt>" }
```

---

#### Login
```
POST /api/auth/login
```
Body:
```json
{ "mail": "john@example.com", "password": "secret" }
```
Response `200`:
```json
{ "token": "<jwt>" }
```

---

#### Logout
```
POST /api/auth/logout
```
Protected. JWTs are stateless — the server cannot invalidate a token. After calling this endpoint the client must delete the token from storage. The token expires naturally after 7 days.

Response `200`:
```json
{ "message": "Logged out" }
```

---

#### Delete account
```
DELETE /api/auth/account
```
Protected. Deletes the account and all associated data.

Response `200`:
```json
{ "message": "Account deleted" }
```

---

### Tags

#### List tags with spending
```
GET /api/tags
```
Protected. Returns every tag with its net transaction sum, plus a grand total. Tags with no transactions do not appear. Untagged transactions appear under `tagId: null`.

Response `200`:
```json
{
  "total": "-125.50",
  "byTag": [
    { "tagId": 1,    "tagName": "Food", "tagIcon": "🍔", "sum": "-75.00" },
    { "tagId": null, "tagName": null,   "tagIcon": null,  "sum": "-50.50" }
  ]
}
```
Negative = net expense, positive = net income.

---

#### Create tag
```
POST /api/tags
```
Protected. Body:
```json
{ "name": "Food", "icon": "🍔" }
```
`icon` is optional.

Response `201`:
```json
{ "id": 1, "userId": 1, "name": "Food", "icon": "🍔" }
```

---

#### Update tag
```
PATCH /api/tags/:id
```
Protected. All fields optional:
```json
{ "name": "Groceries", "icon": "🛒" }
```
Send `"icon": null` to remove the icon.

Response `200`: updated tag object.

---

#### Delete tag
```
DELETE /api/tags/:id
```
Protected.

Response `200`:
```json
{ "message": "Deleted" }
```

---

### Transactions

#### List transactions
```
GET /api/transactions
```
Protected. Results sorted newest first, 20 per page.

Query params:
| Param | Example | Description |
|-------|---------|-------------|
| `page` | `?page=2` | Page number, defaults to `1` |
| `tagId` | `?tagId=3` | Filter by tag id |
| `tagId=none` | `?tagId=none` | Only untagged transactions |

Response `200`:
```json
{
  "data": [{ "id": 1, "userId": 1, "tagId": 2, "amount": "-25.50", "note": "Lunch", "date": "..." }],
  "page": 1,
  "totalPages": 4,
  "total": 73
}
```

---

#### Create transaction
```
POST /api/transactions
```
Protected. Body:
```json
{ "amount": -25.50, "tagId": 2, "note": "Lunch", "date": "2026-06-10T12:00:00Z" }
```
- `amount` — required, positive (income) or negative (expense)
- `tagId`, `note`, `date` — optional

Response `201`: created transaction object.

---

#### Update transaction
```
PATCH /api/transactions/:id
```
Protected. All fields optional:
```json
{ "amount": -30.00, "tagId": 3, "note": "Dinner", "date": "2026-06-10T20:00:00Z" }
```

Response `200`: updated transaction object.

---

#### Delete transaction
```
DELETE /api/transactions/:id
```
Protected.

Response `200`:
```json
{ "message": "Deleted" }
```

---

### Borrowing

#### List borrowings
```
GET /api/borrowing
```
Protected.

Response `200`:
```json
[{ "id": 1, "userId": 1, "amount": "100.00", "date": "...", "returnDate": null, "status": "awaiting" }]
```

---

#### Create borrowing
```
POST /api/borrowing
```
Protected. Body:
```json
{ "amount": 100.00, "date": "2026-06-10T00:00:00Z", "returnDate": null, "status": "awaiting" }
```
- `amount` — required
- `date`, `returnDate`, `status` — optional
- `status` — `"awaiting"` (default) or `"returned"`

Response `201`: created borrowing object.

---

#### Update borrowing
```
PATCH /api/borrowing/:id
```
Protected. All fields optional:
```json
{ "amount": 150.00, "returnDate": "2026-07-01T00:00:00Z", "status": "returned" }
```
Set `"returnDate": null` to mark as not yet returned.

Response `200`: updated borrowing object.

---

#### Delete borrowing
```
DELETE /api/borrowing/:id
```
Protected.

Response `200`:
```json
{ "message": "Deleted" }
```

---

## Error responses

| Status | Meaning |
|--------|---------|
| 400 | Missing or invalid fields |
| 401 | Missing or invalid token |
| 404 | Resource not found (or belongs to another user) |
| 409 | Username or email already taken |
| 503 | Database unreachable (`/api/health`) |
