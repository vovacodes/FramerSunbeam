import { useEffect, useRef } from "react"

export const useOnFocusedChange = (
    focused: boolean,
    focusedChangeHandler: (focused: boolean) => void
) => {
    const prevFocused = usePrevious(focused)

    useEffect(() => {
        if (prevFocused === focused) return
        if (!focusedChangeHandler) return

        focusedChangeHandler(focused)
    }, [prevFocused, focused, focusedChangeHandler])
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
