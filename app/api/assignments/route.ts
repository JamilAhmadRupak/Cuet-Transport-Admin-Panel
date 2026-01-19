import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Assignment } from '@/types';

const dataPath = path.join(process.cwd(), 'data', 'assignments.json');

export async function GET() {
  try {
    const data = await fs.readFile(dataPath, 'utf-8');
    const assignments: Assignment[] = JSON.parse(data);
    return NextResponse.json(assignments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read assignments data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newAssignment: Assignment = await request.json();
    const data = await fs.readFile(dataPath, 'utf-8');
    const assignments: Assignment[] = JSON.parse(data);
    
    assignments.push(newAssignment);
    await fs.writeFile(dataPath, JSON.stringify(assignments, null, 2));
    
    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Assignment ID required' }, { status: 400 });
    }
    
    const data = await fs.readFile(dataPath, 'utf-8');
    let assignments: Assignment[] = JSON.parse(data);
    
    assignments = assignments.filter(a => a.id !== id);
    await fs.writeFile(dataPath, JSON.stringify(assignments, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
  }
}
