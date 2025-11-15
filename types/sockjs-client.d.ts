declare module 'sockjs-client' {
  interface SockJSOptions {
    server?: string
    transports?: string | string[]
    sessionId?: number | (() => string)
    timeout?: number
    devel?: boolean
    debug?: boolean
    protocol_whitelist?: string[]
    rtt?: number
    info?: {
      websocket?: boolean
      cookie_needed?: boolean
      [key: string]: any
    }
    prefix?: string
    [key: string]: any
  }

  class SockJS {
    constructor(url: string, protocols?: string | string[] | null, options?: SockJSOptions)
    url: string
    protocol: string
    readyState: number
    extensions: string
    bufferedAmount: number
    onopen: ((event: Event) => void) | null
    onclose: ((event: CloseEvent) => void) | null
    onmessage: ((event: MessageEvent) => void) | null
    onerror: ((event: Event) => void) | null
    send(data: string | ArrayBuffer | Blob): void
    close(code?: number, reason?: string): void
    addEventListener(type: string, listener: EventListener): void
    removeEventListener(type: string, listener: EventListener): void
    dispatchEvent(event: Event): boolean
  }

  export = SockJS
}

