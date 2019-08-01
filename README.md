# Framer Sunbeam

[![GitHub issues](https://img.shields.io/github/issues/vovaguguiev/FramerSunbeam.svg?color=%23&label=Submit%20issue&logo=github&style=flat-square)](https://github.com/vovaguguiev/FramerSunbeam/issues)
[![GitHub contributors](https://img.shields.io/github/contributors/vovaguguiev/FramerSunbeam.svg?color=%23FF88AA&label=Contribute&logo=github&style=flat-square)](https://github.com/vovaguguiev/FramerSunbeam)
[![Twitter Follow](https://img.shields.io/twitter/follow/wzrdzl.svg?color=%231ca1f2&label=Contact%20author&logo=twitter&style=flat-square)](https://twitter.com/wzrdzl)

Spatial navigation and focus management for TVs and gaming consoles done simple.
Uses [react-sunbeam 🌅](https://github.com/vovaguguiev/react-sunbeam) under the hood.

## Details

Provides three easy to use code components.

-   Drag them onto your canvas
-   Connect them to their content (`Frames` or any other code components)
-   Specify the child property to update on focus for every `Focusable`
-   Drop your `Focusable`s into the Sunbeam `Scroll` component if you need scrolling behaviour
-   Run the preview of the `Frame` containing `SunbeamContainer`
-   Press arrow keys on your keyboard/gamepad/tv remote
-   Enjoy spatial navigation magic happen

## Example Project

You can download the example Framer project that demonstrates how to setup Framer Sunbeam below. Unzip the archive and open the file in Framer X.

![Example project screenshot](https://user-images.githubusercontent.com/1524432/57556043-31c77080-7376-11e9-8afd-5c403954abbb.png)

[SunbeamExampleProject.zip](https://github.com/vovaguguiev/FramerSunbeam/files/3168065/SunbeamExampleProject.zip)

## Components and API

-   [SunbeamContainer](#sunbeamcontainer)
-   [Focusable](#focusable)
-   [Scroll](#scroll)
-   [Using library in your code components (API)](#using-library-in-your-code-components-api)

### `SunbeamContainer`

Creates a focus management context.

Connect it to the `Frame` within which you want focus to be managed
You can only have one `SunbeamContainer` per artboard

#### Props

##### **Up key** - `upKey?: string` - default `"ArrowUp"`

##### **Down key** - `downKey?: string` - default `"ArrowDown"`

##### **Left key** - `leftKey?: string` - default `"ArrowLeft"`

##### **Right key** - `rightKey?: string` - default `"ArrowRight"`

Allows to override the default spacial navigation keys.
See the full list of available key codes [here](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)

##### `onKeyPress?: (event: KeyboardEvent) => void`

Allows to invoke some function when a keyboard key is pressed. Can be provided via [code overrides](https://framer.gitbook.io/framer/code/code-overrides).

##### `onFocusUpdate?: (event: { focusPath: ReadonlyArray<string> }) => void`

Allows to invoke a function when the focus is updated. An event object containing the new `focusPath` is passed to this callback.
Can be provided via [code overrides](https://framer.gitbook.io/framer/code/code-overrides).

##### `getPreferredChildOnFocusReceive?: (args: { focusableChildren: Map<string, FocusableTreeNode>; focusOrigin?: FocusableTreeNode; direction?: Direction; }) => FocusableTreeNode | undefined`

Allows to override the default heuristic of focusing a focusable child when receiving focus.
Can be provided via [code overrides](https://framer.gitbook.io/framer/code/code-overrides).
Example:

```jsx
import { Override } from "framer"
import { defaultGetPreferredChildOnFocusReceive } from "@framer/vladimirg.framersunbeam/code"

function FocusableContainerOverride(): Override {
    return {
        getPreferredChildOnFocusReceive({
            focusableChildren,
            focusOrigin,
            direction,
        }) {
            // Initial load, when there is no previous focused element
            if (!focusOrigin && !direction) {
                // pick the child with a specific focusKey
                return focusableChildren.get("my-preferred-child-focus-key")
            }

            // use default strategy otherwise
            return defaultGetPreferredChildOnFocusReceive({
                focusableChildren,
                focusOrigin,
                direction,
            })
        },
    }
}
```

### `Focusable`

Defines a component that can receive focus.

Connect it to a content component (`Frame` or any other code/design component).
Most of the time you want the size of the `Focusable` to match the size of its child content because when calculating the best candidate for receiving focus Sunbeam uses position and dimensions of the `Focusable`, not its content

You can nest `Focusable`s, in this case the best candidate for the focus is first attempted to be found within the same `Focusable` parent.
This is useful when creating sections of the UI, e.g. Side Menu where the `Focusable` items are not necessarily positioned to each other closer than to the items from the Main section

#### Props

##### **Key** - `focusableKey?: string`

Set to a randomly generated string by default.
Identifier of a `Focusable`. Has to be unique among the `Focusable` siblings

##### **Tap to focus** - `tapToFocus?: boolean`

Set to false by default.
Specifies if the `Focusable` should receive focus when tapped/clicked

##### **Focus prop** - `focusProp?: string`

Name of the child prop that will be updated when `Focusable` receives/loses focus.
E.g. if you are wrapping a Frame you can find the list of the props available to you [here](https://www.framer.com/api/frame/)

##### **Focus prop type** - `focusPropType?: "string" | "boolean" | "number" | "color"`

Type of `focusProp`

##### **Focused value** - `focusedValueString?: string` or `focusedValueBoolean?: boolean` or `focusedValueNumber?: number` or `focusedValueColor?: string`

Value that is passed to the child's prop when the `Focusable` is focused

##### **Blurred value** - `blurredValueString?: string` or `blurredValueBoolean?: boolean` or `blurredValueNumber: number` or `blurredValueColor: string`

Value that is passed to the child's prop when the `Focusable` is blurred

##### `onFocus?: ({ element: HTMLElement; focusablePath: ReadonlyArray<string> }) => void`

Function that is called when the `Focusable` receives focus.
Can be provided via [code overrides](https://framer.gitbook.io/framer/code/code-overrides).
Can be useful for saving the focus state or reacting to the focus updates, e.g. manual scrolling to the focused component

##### `onBlur?: ({ element: HTMLElement; focusablePath: ReadonlyArray<string> }) => void`

Function that is called when the `Focusable` loses focus.
Can be provided via [code overrides](https://framer.gitbook.io/framer/code/code-overrides).

##### `getPreferredChildOnFocusReceive?: (args: { focusableChildren: Map<string, FocusableTreeNode>; focusOrigin?: FocusableTreeNode; direction?: Direction; }) => FocusableTreeNode | undefined`

Allows to override the default heuristic of focusing a focusable child when receiving focus.
Can be provided via [code overrides](https://framer.gitbook.io/framer/code/code-overrides).
Example:

```jsx
import { Override } from "framer"
import { defaultGetPreferredChildOnFocusReceive } from "@framer/vladimirg.framersunbeam/code"

function FocusableContainerOverride(): Override {
    return {
        getPreferredChildOnFocusReceive({
            focusableChildren,
            focusOrigin,
            direction,
        }) {
            // Initial load, when there is no previous focused element
            if (!focusOrigin && !direction) {
                // pick the child with a specific focusKey
                return focusableChildren.get("my-preferred-child-focus-key")
            }

            // use default strategy otherwise
            return defaultGetPreferredChildOnFocusReceive({
                focusableChildren,
                focusOrigin,
                direction,
            })
        },
    }
}
```

### `Scroll`

Mimics the behaviour of the Framer built-in `Scroll` component but it is aware
of the currently focused `Focusable` child and automatically scrolls it into view when needed.
This component is useful for creating scrollable carousels and grids of `Focusable` components

#### Props

##### **Overflow** - `overflow: boolean`

Specifies whether the content overflowing the `Scroll` viewport should be visible or not

##### **Direction** - `direction: "vertical" | "horizontal" | "both"`

The allowed direction of scrolling

##### **Transition** - `transitionType: "spring" | "tween"`

Type of the transition to use for scrolling: [Spring](https://www.framer.com/api/animation/#spring) or [Tween](https://www.framer.com/api/animation/#tween)

##### **Damping** - `damping: number`

Damping parameter of the Spring transition. See more [here](https://www.framer.com/api/animation/#spring.damping)

##### **Stiffness** - `stiffness: number`

Stiffness parameter of the Spring transition. See more [here](https://www.framer.com/api/animation/#spring.stiffness)

##### **Duration** - `duration: number`

Duration parameter of the Tween transition. See more [here](https://www.framer.com/api/animation/#tween.duration)

##### **Easing** - `easing: "linear" | "easeIn" | "easeOut" | "easeInOut" | "circIn" | "circOut" | "circInOut" | "backIn" | "backOut" | "backInOut" | "anticipate"`

Easing parameter of the Tween transition. See more [here](https://www.framer.com/api/animation/#tween.ease)

### Using library in your code components (API)

Framer Sunbeam re-exports some of the [react-sunbeam 🌅](https://github.com/vovaguguiev/react-sunbeam) primitives
and other helper functions so you can use them directly in you code to create your own custom focusable
components without connecting a Focusable to another component on canvas.

#### Example

You can implement your own focusable Button like this:

```tsx
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { useFocusable, useOnFocusedChange } from "@framer/vladimirg.framersunbeam/code"

addPropertyControls(Button, {
    focusKey: {
        type: ControlType.String,
        defaultValue: "CHANGE THIS TO A UNIQUE VALUE",
    },
})

export function Button({ focusKey, width, height }) {
    const ref = React.useRef(null)
    const { focused } = useFocusable(focusKey, ref)

    useOnFocusedChange(focused, (isFocused) => {
        if (isFocused) console.log(`${focusKey}` was focused)
    })

    return (
        <button
            ref={ref}
            style={{
                width,
                height,
                border: focused ? "2px solid tomato" : "none",
            }}
        >
            Go
        </button>
    )
}
```

## CHANGELOG

### v1.32.0

-   Expose `useOnFocusedChange` hook
-   New `onBlur` prop on `Focusable`

### v1.31.0

Expose `getPreferredChildOnFocusReceive` prop for `SunbeamContainer` and `Focusable`

### v1.29.0

Fix `Scroll` fill

### v1.25.0

Expose property controls for `Scroll`'s transition

### v1.24.0

Remove `ScrollContext` and `useOnFocus`, instead add the Scroll notification logic to `useFocusable`

### v1.22.0

Remove `ScrollContext` from module export but export it as a global variable `SunbeamScrollContext`

### v1.21.0

Export `ScrollContext` and `useOnFocus`

### v1.20.0

Export `Focusable`, `useSunbeam`, `useFocusable` and `defaultGetPreferredChildOnFocusReceive` so those can be used
directly in your custom code components.

### v1.19.0

Add `onKeyPress` and `onFocusUpdate` props to `SunbeamContainer`

### v1.15.0

Proudly introducing the new component - `Scroll` 🎉.
It mimics the behaviour of the Framer built-in `Scroll` component but it is aware of the currently focused `Focusable`
and automatically scrolls it into view

### v1.14.0

BREAKING CHANGE: `onFocus` callback now accepts an object of type `{ element: HTMLElement; focusablePath: string[] }` as an argument, before it was a string `focusablePath`
