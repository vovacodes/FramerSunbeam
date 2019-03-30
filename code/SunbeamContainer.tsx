import * as React from "react"
import { useMemo, useCallback, useEffect } from "react"
import { FocusManager, SunbeamProvider } from "react-sunbeam"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

interface Props {
    width: number
    height: number
    children: JSX.Element
}

export function SunbeamContainer({ height, width, children }: Props) {
    const focusManager = useMemo(
        () =>
            new FocusManager({
                initialFocusPath: [],
            }),
        []
    )

    const renderTarget = RenderTarget.current()

    const onKeyDown = useCallback(
        (event: Event) => {
            if (!(event instanceof KeyboardEvent)) return

            switch (event.key) {
                case "ArrowRight":
                    focusManager.moveRight()
                    return

                case "ArrowLeft":
                    focusManager.moveLeft()
                    return

                case "ArrowUp":
                    focusManager.moveUp()
                    return

                case "ArrowDown":
                    focusManager.moveDown()
                    return
            }
        },
        [renderTarget]
    )

    useGlobalEventListener("keydown", onKeyDown)

    if (renderTarget === RenderTarget.canvas) {
        const content =
            React.Children.count(children) > 0 ? (
                children
            ) : (
                <div
                    style={{
                        height,
                        width,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 30,
                    }}
                >
                    Link this component to a frame
                </div>
            )

        return <>{content}</>
    }

    return (
        <SunbeamProvider focusManager={focusManager}>
            {children}
        </SunbeamProvider>
    )
}

addPropertyControls(SunbeamContainer, {
    children: { type: ControlType.ComponentInstance, title: "child" },
})

type EventListener = (evt: Event) => void
function useGlobalEventListener<E extends Event>(
    eventName: string,
    listener: EventListener
) {
    useEffect(() => {
        window.addEventListener(eventName, listener)

        return () => {
            window.removeEventListener(eventName, listener)
        }
    }, [eventName, listener])
}
