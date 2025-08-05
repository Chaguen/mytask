import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { validateTodos } from "@/lib/schemas";
import { TODO_STORAGE_FILE } from "@/constants/todo";

const DATA_FILE_PATH = path.join(process.cwd(), TODO_STORAGE_FILE);

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE_PATH);
  } catch {
    await fs.writeFile(DATA_FILE_PATH, "[]", "utf-8");
  }
}

export async function GET() {
  try {
    await ensureDataFile();
    const data = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const parsedData = JSON.parse(data);
    
    // Validate data structure
    const validatedTodos = validateTodos(parsedData);
    return NextResponse.json(validatedTodos);
  } catch (error) {
    console.error("Error reading todos:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to read todos: ${error.message}` }, 
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Failed to read todos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate incoming data
    const validatedTodos = validateTodos(body);
    
    // Create backup before writing
    try {
      const currentData = await fs.readFile(DATA_FILE_PATH, "utf-8");
      await fs.writeFile(`${DATA_FILE_PATH}.backup`, currentData, "utf-8");
    } catch {
      // Backup creation is optional
    }
    
    // Write validated data
    await fs.writeFile(
      DATA_FILE_PATH, 
      JSON.stringify(validatedTodos, null, 2), 
      "utf-8"
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving todos:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to save todos: ${error.message}` }, 
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to save todos" }, { status: 500 });
  }
}