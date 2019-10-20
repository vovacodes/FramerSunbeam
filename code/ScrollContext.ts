import { createContext } from "react"

export type FramerSunbeamGlobals = {
    SunbeamScrollContext: typeof ScrollContext
}

export type ScrollContextValue = {
    notifyScrollOnFocus: (args: { boundingBox: ClientRect }) => void
}

export const ScrollContext = createContext<ScrollContextValue | null>({
        notifyScrollOnFocus: () => {},
    })

    // Because of the limitation of Framer X we can't
    // export singletons as a module from the package
    // so exporting it as a global variable for now
;((window as unknown) as FramerSunbeamGlobals).SunbeamScrollContext = ScrollContext
