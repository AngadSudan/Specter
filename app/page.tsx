"use client"

import { useAgent } from "@/app/utils/agent"
import type { RealtimeItem } from "@openai/agents/realtime"
import { useState, useRef, useEffect } from "react"
import { Mic, MicOff } from "lucide-react"

export default function Page() {
  const { session: sessionRef, connect } = useAgent()
  const [isConnected, setIsConnected] = useState(false)
  const [history, setHistory] = useState<RealtimeItem[]>([])
  const [isListening, setIsListening] = useState(false)
  const historyIntervalRef = useRef<NodeJS.Timeout>(null)
  const bottomRef = useRef(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history])

  const handleConnect = async () => {
    setHistory([])
    await connect()
    setIsConnected(true)
    setIsListening(true)
  }

  useEffect(() => {
    if (isConnected) {
      historyIntervalRef.current = setInterval(() => {
        const currentHistory = sessionRef.current?.history || []
        setHistory(currentHistory)
      }, 300)

      return () => {
        if (historyIntervalRef.current) {
          clearInterval(historyIntervalRef.current)
        }
      }
    }
  }, [isConnected, sessionRef])

  const latestTranscript = history
    .slice()
    .reverse()
    //@ts-ignore
    .find((item) => item?.content?.[0]?.transcript)?.content?.[0]?.transcript

  const transcripts = history
    //@ts-ignore
    .filter((item) => item?.content?.[0]?.transcript)
    .map((item) => ({
      //@ts-ignore
      id: item.id,
      //@ts-ignore
      agent: item?.role === "user" ? true : false,
      //@ts-ignore
      text: item.content[0].transcript,
    }))

  return (
    <div className="min-h-screen w-full bg-black flex overflow-hidden">
      {!isConnected ? (
        // Initial state: centered connect button
        <div className="w-full flex flex-col items-center justify-center">
          <button
            onClick={handleConnect}
            className="relative px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <span className="flex items-center gap-2">
              <Mic size={20} />
              Connect to Voice Agent
            </span>
          </button>
          <p className="text-gray-400 mt-4 text-sm">Click to activate Jarvis</p>
        </div>
      ) : (
        // Connected state: Jarvis interface with sidebar
        <div className="w-full flex flex-col md:flex-row gap-0">
          {/* Main center area with circular AI visualization */}
          <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden min-h-96 md:min-h-screen">
            <div className="relative w-32 h-32 md:w-48 md:h-48 mb-8">
              {/* Outer pulsing circle */}
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-pulse"></div>

              {/* Middle rotating circle */}
              <div
                className="absolute inset-4 rounded-full border border-blue-400/50 animate-spin"
                style={{ animationDuration: "3s" }}
              ></div>

              {/* Inner glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-blue-600/20 to-transparent blur-xl"></div>

              {/* Center core */}
              <div className="absolute inset-8 rounded-full bg-blue-600/40 backdrop-blur-sm flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-blue-400 animate-pulse"></div>
              </div>
            </div>

            {latestTranscript && (
              <div className="absolute top-16 md:top-24 w-sm mx-auto max-w-xs md:max-w-md px-4 md:px-6 py-3 md:py-4 bg-white/5 backdrop-blur-md rounded-lg border border-blue-400/30 text-center">
                <p className="text-white text-xs md:text-sm mx-auto font-medium text-balance">{latestTranscript}</p>
                <div className="mt-2 flex gap-1 justify-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            {/* Status indicator */}
            <div className="absolute bottom-4 md:bottom-8 text-center">
              <div className="flex items-center gap-2 justify-center text-blue-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold tracking-widest">
                  {isListening ? "LISTENING" : "PROCESSING"}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-160 h-auto md:h-screen bg-gradient-to-b from-slate-900 to-black border-t md:border-t-0 md:border-l border-blue-500/20 flex flex-col">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-blue-500/20">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <h2 className="text-white font-semibold text-base md:text-lg">Conversation</h2>
              </div>
            </div>

            {/* Chat history scroll area */}
            <div
              className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:h-[80%]"
              style={{
                overflowY: "auto",
                msOverflowStyle: "none", // IE + Edge
                scrollbarWidth: "none", // Firefox
              }}
            >
              {transcripts.length === 0 ? (
                <p className="text-gray-500 text-sm text-center mt-8">Awaiting input...</p>
              ) : (
                transcripts.map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-blue-500/10 hover:border-blue-500/30 transition-all duration-200 cursor-pointer group ${item.agent ? "text-left" : "text-right"}`}
                  >
                    <p className="text-xs md:text-sm font-semibold">{item.agent ? "User" : "Agent"}</p>
                    <p className="text-gray-300 text-xs leading-relaxed group-hover:text-white transition-colors line-clamp-3">
                      {item.text}
                    </p>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Footer with disconnect button */}
            <div className="p-3 md:p-4 border-t border-blue-500/20">
              <button
                onClick={async () => {
                  setIsConnected(false)
                  setIsListening(false)
                  setHistory([])
                  await sessionRef.current.close()
                }}
                className="w-full px-4 py-2 text-xs md:text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-red-600/20 border border-blue-500/20 hover:border-red-500/50 rounded transition-all duration-200 flex items-center justify-center gap-2"
              >
                <MicOff size={16} />
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
