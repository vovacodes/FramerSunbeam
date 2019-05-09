import { createContext } from "react"

export const ScrollContext = createContext<{
    notifyScrollOnFocus: ({ boundingBox: ClientRect }) => void
} | null>(null)
