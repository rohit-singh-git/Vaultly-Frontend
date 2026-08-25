/**
 * Central runtime config for the API layer.
 *
 * Phase 2 checklist (this file + api.js are the ONLY two files that should
 * need to change to go from mock to real backend):
 *   1. Set VITE_API_BASE_URL in .env to the real backend URL.
 *   2. Set VITE_USE_MOCK=false in .env.
 *   3. Inside services/api.js, replace each function body's mock logic with
 *      a fetch() call to `${API_BASE_URL}/...`, keeping the same function
 *      signature and the same resolved/rejected shape documented in
 *      services/API_CONTRACT.md.
 *   4. No component, page, or context should need to change, since they
 *      only ever import from services/api.js.
 */

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

// Mock network conditions — tune these to rehearse slow/flaky connections
// before the real backend exists. Set MOCK_FAILURE_RATE > 0 to test error
// handling paths (toasts, retry buttons, etc.) under Phase 1.
export const MOCK_LATENCY_MS = 400
export const MOCK_FAILURE_RATE = 0
