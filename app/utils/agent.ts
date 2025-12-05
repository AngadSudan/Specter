"use client";

import { useRef, useCallback } from "react";
import axios from "axios";
import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";

export function useAgent() {
  const sessionRef = useRef<RealtimeSession | null>(null);

  /**
   * Connect to OpenAI Realtime API
   */
  const connect = useCallback(async () => {
    if (sessionRef.current) return sessionRef.current;

    // Create agent
    const agent = new RealtimeAgent({
      name: "Assistant",
      instructions: "You are a helpful voice assistant.",
      voice: "alloy",
    });

    // Create session
    const session = new RealtimeSession(agent);
    sessionRef.current = session;

    // Retrieve ephemeral key
    const resp = await axios.get("/api/token");
    if (!resp.data.token) throw new Error("Missing ephemeral token");

    // Connect
    await session.connect({
      apiKey: resp.data.token,
    });

    sessionRef.current.on("audio_start",(stream)=>{
      console.log("audo started")
      console.log(stream);
    })

    sessionRef.current.on("audio_stopped",(stream)=>{
      console.log("audio stopped");
    })

    console.log("Realtime Agent Connected");
    return session;
  }, []);

  /**
   * Subscribe to session events
   */
  const onEvent = useCallback(
    (eventName: string, handler: (...args: any[]) => void) => {
      if (!sessionRef.current) {
        console.warn("Session not connected yet");
        return;
      }
      // @ts-ignore
      sessionRef.current.on(eventName, handler);
    },
    []
  );

  return {
    session: sessionRef,
    connect,
    onEvent,
  };
}
