import { useContext, MutableRefObject } from "react"
import {
    useFocusable as useFocusableSunbeam,
    KeyPressListener,
    FocusEvent,
} from "react-sunbeam"
import { useOnFocusedChange } from "./useOnFocusedChange"
import { FramerSunbeamGlobals } from "./ScrollContext"

type Element = MutableRefObject<{
    getBoundingClientRect(): ClientRect
}>

export function useFocusable(
    focusKey: string,
    ref: Element,
    options?: {
        onKeyPress?: KeyPressListener
        onFocus?: (event: FocusEvent) => void
        onBlur?: (event: FocusEvent) => void
    }
): { focused: boolean; path: string[] } {
    const focusableData = useFocusableSunbeam({
        elementRef: ref,
        focusKey,
        ...options,
    })

    // implement the logic necessary for Scroll component to be aware
    const contextValue = useContext(
        ((window as unknown) as FramerSunbeamGlobals).SunbeamScrollContext
    )
    const notifyScrollOnFocus = contextValue
        ? contextValue.notifyScrollOnFocus
        : null
    useOnFocusedChange(focusableData.focused, isFocused => {
        if (!isFocused) return
        if (notifyScrollOnFocus)
            notifyScrollOnFocus({
                boundingBox: ref.current.getBoundingClientRect(),
            })
    })

    return focusableData
}
