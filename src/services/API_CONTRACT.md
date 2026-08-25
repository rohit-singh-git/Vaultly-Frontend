# services/api.js — API Contract

This is the complete interface every screen in Vaultly talks to. In Phase 1
every function here is mocked (in-memory data + artificial delay). In Phase 2,
each function's *body* gets replaced with a real `fetch()` call — its
signature and resolved/rejected shape must stay identical, so no component
needs to change.

General convention: every function returns a `Promise`.
- Success → resolves with the documented shape.
- Failure → rejects with an `Error` whose `.message` is user-displayable
  (shown directly in toasts/inline errors) and whose `.status` is an HTTP-like
  status code.

---

## auth

| Function | Params | Resolves with |
|---|---|---|
| `login(email, password)` | strings | `{ user, token }` |
| `signup(name, email, password)` | strings | `{ pendingVerification: true, email }` |
| `verifyOtp(email, code)` | strings | `{ user, token }` |
| `requestPasswordReset(email)` | string | `{ sent: true, exists: boolean }` |
| `logout()` | — | `undefined` |
| `getCurrentUser()` | — | `user \| null` |

`user` shape: `{ id, name, email }` (never includes password/token).

Phase 2 note: session persistence currently uses `localStorage`. Replace with
httpOnly cookies or a token refresh flow as appropriate — `AuthContext.jsx`
only calls `auth.getCurrentUser()` on mount, so this is fully encapsulated.

## files

| Function | Params | Resolves with |
|---|---|---|
| `list(folderId)` | `string \| null` | `{ items: Item[], path: Folder[] }` |
| `listFolders(parentId, excludeId)` | `string \| null, string \| null` | `{ folders: Folder[], path: Folder[] }` |
| `createFolder(name, parentId)` | string, `string \| null` | `Folder` |
| `upload(file, folderId, onProgress, { signal })` | `File`, id, callback, `AbortController.signal` | `Item` |
| `rename(fileId, newName)` | strings | `Item` |
| `move(fileId, targetFolderId)` | string, `string \| null` | `Item` |
| `remove(fileId)` | string | `undefined` (cascades to children if it's a folder) |

`Item` shape: `{ id, parentId, type, name, size?, modifiedAt, owner }`
`type` is `'folder' \| 'pdf' \| 'doc' \| 'sheet' \| 'image' \| 'video' \| 'default'`

Phase 2 note: `upload()` must support **real** chunked/resumable upload and
genuine cancellation via `AbortController` — `UploadContext.jsx` already
assumes this contract (progress callback + abortable), so the concurrent
upload queue UI needs no changes.

## sharing

| Function | Params | Resolves with |
|---|---|---|
| `getShares(fileId)` | string | `{ people: Share[], link: LinkShare }` |
| `share(fileId, email, accessLevel)` | strings | `Share[]` (all shares for that file) |
| `updateAccess(fileId, email, accessLevel)` | strings | `undefined` |
| `unshare(fileId, email)` | strings | `undefined` |
| `setLinkSharing(fileId, enabled)` | string, boolean | `LinkShare` |
| `setLinkAccess(fileId, accessLevel)` | strings | `LinkShare` |
| `getShareLink(fileId)` | string | `string \| null` (full URL) |

`Share`: `{ fileId, email, accessLevel }` — `accessLevel` is `'view' \| 'edit'`
`LinkShare`: `{ enabled, accessLevel, token }`

## search

| Function | Params | Resolves with |
|---|---|---|
| `query(term, filters)` | string, `{ type?, modified?, owner? }` | `Item[]` (each with an extra `path: Folder[]`) |

Phase 2 note: this currently does an in-memory substring scan across every
item. A real backend should push this to a DB query / search index —
`SearchBar.jsx` already debounces (250ms) before calling, so no extra
throttling is needed on the frontend side.

## quota

| Function | Params | Resolves with |
|---|---|---|
| `get()` | — | `{ usedBytes, totalBytes, breakdown, fileCount }` |

`breakdown` is `{ [type]: bytes }` for the per-type usage bars in Settings.

---

## Where this is consumed

Every page/component that touches data imports directly from `services/api.js`
— nothing reaches into mock data structures directly. Confirmed via:
`grep -rl "services/api" src/pages src/components src/context`

Consumers: `AuthContext`, `UploadContext`, `Drive.jsx`, `Settings.jsx`,
`Sidebar.jsx`, `ShareModal.jsx`, `MoveFileModal.jsx`, `ForgotPassword.jsx`.

## Config (`services/config.js`)

- `USE_MOCK` / `API_BASE_URL` — read from `VITE_USE_MOCK` / `VITE_API_BASE_URL`
  env vars. Flip these when Phase 2 backend is ready.
- `MOCK_LATENCY_MS` / `MOCK_FAILURE_RATE` — tune to rehearse slow networks or
  error states in Phase 1 without touching component code. Set
  `MOCK_FAILURE_RATE` to e.g. `0.2` locally to verify every screen's error
  states (toasts, retry buttons) actually work before the real backend can
  produce real failures.

## Standardized loading/error state (`hooks/useAsync.js`)

New in Task 10. Wraps any `services/api.js` call with consistent
`{ data, loading, error, reload }` state, including stale-response
protection (a slow older call can't clobber a faster newer one — relevant
once real network latency is unpredictable in Phase 2). Used in
`Settings.jsx`. `Drive.jsx` keeps its hand-written state because its
loading logic is intertwined with upload-completion refresh and search-mode
switching, which doesn't fit the generic hook cleanly — noted here so a
future pass doesn't "fix" that inconsistency without knowing why it's there.
