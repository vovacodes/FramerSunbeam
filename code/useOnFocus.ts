import { useEffect, useRef } from "react"

export const useOnFocus = (focused: boolean, onFocus: () => void) => {
    const prevFocused = usePrevious(focused)

    useEffect(() => {
        if (prevFocused === focused) return

        if (focused && onFocus) {
            onFocus()
            return
        }
    }, [prevFocused, focused, onFocus])
}

function usePrevious<T>(value: T): T {
    const ref = useRef<T>(value)

    // Store current value in ref
    useEffect(() => {
        ref.current = value
    }, [value])

    // Return previous value (happens before update in useEffect above)
    return ref.current
}
