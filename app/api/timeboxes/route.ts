import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { TimeboxItem } from '@/types/timebox';

const TIMEBOXES_FILE = path.join(process.cwd(), 'timeboxes.json');
const BACKUP_FILE = path.join(process.cwd(), 'timeboxes.json.backup');

// GET: Load timeboxes from file
export async function GET() {
  try {
    const fileExists = await fs.access(TIMEBOXES_FILE).then(() => true).catch(() => false);
    
    if (!fileExists) {
      // Create default empty structure
      const defaultData: TimeboxItem[] = [];
      await fs.writeFile(TIMEBOXES_FILE, JSON.stringify(defaultData, null, 2));
      return NextResponse.json(defaultData);
    }
    
    const data = await fs.readFile(TIMEBOXES_FILE, 'utf-8');
    const timeboxes = JSON.parse(data);
    return NextResponse.json(timeboxes);
  } catch (error) {
    console.error('Failed to load timeboxes:', error);
    return NextResponse.json({ error: 'Failed to load timeboxes' }, { status: 500 });
  }
}

// POST: Save timeboxes to file
export async function POST(request: Request) {
  try {
    const timeboxes: TimeboxItem[] = await request.json();
    
    // Validate the data structure
    if (!Array.isArray(timeboxes)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }
    
    // Create backup before saving
    const fileExists = await fs.access(TIMEBOXES_FILE).then(() => true).catch(() => false);
    if (fileExists) {
      const currentData = await fs.readFile(TIMEBOXES_FILE, 'utf-8');
      await fs.writeFile(BACKUP_FILE, currentData);
    }
    
    // Save new data
    await fs.writeFile(TIMEBOXES_FILE, JSON.stringify(timeboxes, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save timeboxes:', error);
    return NextResponse.json({ error: 'Failed to save timeboxes' }, { status: 500 });
  }
}