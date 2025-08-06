import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { TimerSession } from "@/types/timer";

const DATA_FILE_PATH = path.join(process.cwd(), "timer-sessions.json");

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE_PATH);
  } catch {
    await fs.writeFile(DATA_FILE_PATH, "[]", "utf-8");
  }
}

export async function GET(request: Request) {
  try {
    await ensureDataFile();
    const data = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const sessions: TimerSession[] = JSON.parse(data);
    
    // Get date parameter from query
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    
    // Filter by date if provided
    if (date) {
      const filteredSessions = sessions.filter(s => s.date === date);
      return NextResponse.json(filteredSessions);
    }
    
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error reading timer sessions:", error);
    return NextResponse.json({ error: "Failed to read timer sessions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDataFile();
    
    const newSession: TimerSession = await request.json();
    
    // Read existing sessions
    const data = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const sessions: TimerSession[] = JSON.parse(data);
    
    // Add new session
    sessions.push(newSession);
    
    // Sort by startedAt (newest first)
    sessions.sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
    
    // Write back
    await fs.writeFile(
      DATA_FILE_PATH,
      JSON.stringify(sessions, null, 2),
      "utf-8"
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving timer session:", error);
    return NextResponse.json({ error: "Failed to save timer session" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureDataFile();
    
    const { id, updates } = await request.json();
    
    // Read existing sessions
    const data = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const sessions: TimerSession[] = JSON.parse(data);
    
    // Find and update session
    const index = sessions.findIndex(s => s.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    
    sessions[index] = { ...sessions[index], ...updates };
    
    // Write back
    await fs.writeFile(
      DATA_FILE_PATH,
      JSON.stringify(sessions, null, 2),
      "utf-8"
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating timer session:", error);
    return NextResponse.json({ error: "Failed to update timer session" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureDataFile();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }
    
    // Read existing sessions
    const data = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const sessions: TimerSession[] = JSON.parse(data);
    
    // Filter out the session to delete
    const filteredSessions = sessions.filter(s => s.id !== id);
    
    if (filteredSessions.length === sessions.length) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    
    // Write back
    await fs.writeFile(
      DATA_FILE_PATH,
      JSON.stringify(filteredSessions, null, 2),
      "utf-8"
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting timer session:", error);
    return NextResponse.json({ error: "Failed to delete timer session" }, { status: 500 });
  }
}