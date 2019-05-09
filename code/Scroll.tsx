import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { ScrollContext } from "./ScrollContext"

interface Props {
    width: number
    height: number
    children: React.ReactElement
    overflow: boolean
    direction: "vertical" | "horizontal" | "both"
}

export function Scroll({
    width,
    height,
    children,
    overflow,
    direction,
}: Props) {
    const viewportRef = React.useRef(null)
    const trackRef = React.useRef(null)
    const [scrollX, setScrollX] = React.useState(0)
    const [scrollY, setScrollY] = React.useState(0)

    const onChildFocus = React.useCallback(
        ({
            boundingBox: focusedElementBoundingBox,
        }: {
            boundingBox: ClientRect
        }) => {
            const track = trackRef.current
            const viewport = viewportRef.current
            const {
                width: viewportWidth,
                height: viewportHeight,
                left: viewportLeft,
                top: viewportTop,
            } = viewport.getBoundingClientRect()
            const scaleX = viewportWidth / viewport.offsetWidth
            const scaleY = viewportHeight / viewport.offsetHeight
            const {
                width: elementWidth,
                height: elementHeight,
                left: elementLeft,
                top: elementTop,
            } = focusedElementBoundingBox
            const elementOffsetLeft = elementLeft - viewportLeft
            const elementOffsetTop = elementTop - viewportTop
            const elementRightEdge = elementOffsetLeft + elementWidth
            const elementBottomEdge = elementOffsetTop + elementHeight

            let newScrollX = 0
            if (direction === "horizontal" || direction === "both") {
                let deltaScrollX = 0
                if (elementLeft < viewportLeft) {
                    deltaScrollX = (elementLeft - viewportLeft) / scaleX
                } else if (elementRightEdge > viewportWidth) {
                    deltaScrollX = (elementRightEdge - viewportWidth) / scaleX
                }
                newScrollX = ensureScrollXWithinBounds(scrollX + deltaScrollX)
                function ensureScrollXWithinBounds(value: number): number {
                    const minScrollX = 0
                    const maxScrollX = track.scrollWidth - viewport.offsetWidth
                    if (value < minScrollX) return minScrollX
                    if (value > maxScrollX) return maxScrollX
                    return value
                }
            }

            let newScrollY = 0
            if (direction === "vertical" || direction === "both") {
                let deltaScrollY = 0
                if (elementTop < viewportTop) {
                    deltaScrollY = (elementTop - viewportTop) / scaleY
                } else if (elementBottomEdge > viewportHeight) {
                    deltaScrollY = (elementBottomEdge - viewportHeight) / scaleY
                }
                newScrollY = ensureScrollYWithinBounds(scrollY + deltaScrollY)
                function ensureScrollYWithinBounds(value: number): number {
                    const minScrollY = 0
                    const maxScrollY =
                        track.scrollHeight - viewport.offsetHeight
                    if (value < minScrollY) return minScrollY
                    if (value > maxScrollY) return maxScrollY
                    return value
                }
            }

            if (newScrollX !== scrollX) setScrollX(newScrollX)
            if (newScrollY !== scrollY) setScrollY(newScrollY)
        },
        [scrollX, scrollY]
    )
    const contextValue = React.useMemo(
        () => ({ notifyScrollOnFocus: onChildFocus }),
        [onChildFocus]
    )

    const child = children && React.Children.toArray(children)[0]

    return (
        <ScrollContext.Provider value={contextValue}>
            <div
                ref={viewportRef}
                style={{
                    width,
                    height,
                    overflow: overflow ? "visible" : "hidden",
                }}
            >
                <div
                    ref={trackRef}
                    style={{
                        position: "relative",
                        width: child && child.props.width,
                        height: child && child.props.height,
                        transform: `translate(${-scrollX}px, ${-scrollY}px)`,
                        transition: "transform 150ms ease-out",
                        willChange: "transform",
                    }}
                >
                    {child}
                </div>
            </div>
        </ScrollContext.Provider>
    )
}

addPropertyControls(Scroll, {
    overflow: {
        type: ControlType.Boolean,
        title: "Overflow",
        defaultValue: true,
        enabledTitle: "Show",
        disabledTitle: "Hide",
    },
    direction: {
        type: ControlType.SegmentedEnum,
        title: "Direction",
        options: ["vertical", "horizontal", "both"],
        optionTitles: [
            <span style={{ fontSize: "30px" }}>↕</span>,
            "↔",
            <span
                dangerouslySetInnerHtml={{ __html: "&#x6F&#x332;" }}
                style={{ fontSize: "30px" }}
            />,
        ] as any,
        defaultValue: "both",
    },
})
