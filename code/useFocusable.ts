import { useContext, MutableRefObject } from "react"
import { useFocusable as useFocusableSunbeam } from "react-sunbeam"
import { useOnFocusedChange } from "./useOnFocusedChange"
import { ScrollContextValue } from "./ScrollContext"

type Element = MutableRefObject<{
    getBoundingClientRect(): ClientRect
}>

export function useFocusable(
    focusKey: string,
    ref: Element
): { focused: boolean; path: string[] } {
    const focusableData = useFocusableSunbeam(focusKey, ref)

    // implement the logic necessary for Scroll component to be aware
    const contextValue = useContext<ScrollContextValue>(
        (window as any).SunbeamScrollContext
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
