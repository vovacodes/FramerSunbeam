import * as React from "react"
import { useMemo, useCallback, useEffect } from "react"
import { FocusManager, SunbeamProvider } from "react-sunbeam"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

interface Props {
    children: JSX.Element
    height: number
    width: number
    upKey?: string
    downKey?: string
    leftKey?: string
    rightKey?: string
}

export function SunbeamContainer({
    height,
    width,
    children,
    upKey = "ArrowUp",
    downKey = "ArrowDown",
    leftKey = "ArrowLeft",
    rightKey = "ArrowRight",
}: Props) {
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

            if (renderTarget !== RenderTarget.preview) return

            switch (event.key) {
                case rightKey:
                    event.preventDefault()
                    event.stopPropagation()
                    focusManager.moveRight()
                    return

                case leftKey:
                    event.preventDefault()
                    event.stopPropagation()
                    focusManager.moveLeft()
                    return

                case upKey:
                    event.preventDefault()
                    event.stopPropagation()
                    focusManager.moveUp()
                    return

                case downKey:
                    event.preventDefault()
                    event.stopPropagation()
                    focusManager.moveDown()
                    return
            }
        },
        [upKey, downKey, leftKey, rightKey]
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
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "monospace",
                        fontSize: 30,
                    }}
                >
                    <div>SunbeamContainer</div>
                    <div style={{ textAlign: "center" }}>
                        Link this component to a Frame
                    </div>
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
    upKey: {
        type: ControlType.String,
        title: "Up key",
        defaultValue: "ArrowUp",
    },
    downKey: {
        type: ControlType.String,
        title: "Down key",
        defaultValue: "ArrowDown",
    },
    leftKey: {
        type: ControlType.String,
        title: "Left key",
        defaultValue: "ArrowLeft",
    },
    rightKey: {
        type: ControlType.String,
        title: "Right key",
        defaultValue: "ArrowRight",
    },
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
