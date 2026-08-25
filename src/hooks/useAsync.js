import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Wraps a call to services/api.js with consistent loading/error/data state.
 *
 *   const { data, loading, error, reload } = useAsync(() => quota.get(), [])
 *
 * - Re-runs automatically whenever `deps` changes.
 * - `reload()` re-runs manually (e.g. after a mutation elsewhere).
 * - Ignores results from stale calls if a newer call started first, so a
 *   fast folder-navigation click can't get overwritten by a slow older
 *   response arriving late.
 */
export function useAsync(asyncFn, deps = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const callId = useRef(0);

    const run = useCallback(() => {
        const thisCallId = ++callId.current;
        setLoading(true);
        setError(null);
        return asyncFn()
            .then((result) => {
                if (thisCallId === callId.current) {
                    setData(result);
                    setLoading(false);
                }
                return result;
            })
            .catch((err) => {
                if (thisCallId === callId.current) {
                    setError(err);
                    setLoading(false);
                }
                throw err;
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, loading, error, reload: run };
}
