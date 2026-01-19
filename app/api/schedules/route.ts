import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Schedule } from '@/types';

const dataPath = path.join(process.cwd(), 'data', 'schedules.json');

export async function GET() {
  try {
    const data = await fs.readFile(dataPath, 'utf-8');
    const schedules: Schedule[] = JSON.parse(data);
    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read schedules data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newSchedule: Schedule = await request.json();
    const data = await fs.readFile(dataPath, 'utf-8');
    const schedules: Schedule[] = JSON.parse(data);
    
    schedules.push(newSchedule);
    await fs.writeFile(dataPath, JSON.stringify(schedules, null, 2));
    
    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedSchedule: Schedule = await request.json();
    const data = await fs.readFile(dataPath, 'utf-8');
    let schedules: Schedule[] = JSON.parse(data);
    
    const index = schedules.findIndex(s => s.id === updatedSchedule.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }
    
    schedules[index] = updatedSchedule;
    await fs.writeFile(dataPath, JSON.stringify(schedules, null, 2));
    
    return NextResponse.json(updatedSchedule);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 });
    }
    
    const data = await fs.readFile(dataPath, 'utf-8');
    let schedules: Schedule[] = JSON.parse(data);
    
    schedules = schedules.filter(s => s.id !== id);
    await fs.writeFile(dataPath, JSON.stringify(schedules, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
  }
}
