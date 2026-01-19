import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Bus } from '@/types';

const dataPath = path.join(process.cwd(), 'data', 'buses.json');

export async function GET() {
  try {
    const data = await fs.readFile(dataPath, 'utf-8');
    const buses: Bus[] = JSON.parse(data);
    return NextResponse.json(buses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read buses data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newBus: Bus = await request.json();
    const data = await fs.readFile(dataPath, 'utf-8');
    const buses: Bus[] = JSON.parse(data);
    
    buses.push(newBus);
    await fs.writeFile(dataPath, JSON.stringify(buses, null, 2));
    
    return NextResponse.json(newBus, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create bus' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedBus: Bus = await request.json();
    const data = await fs.readFile(dataPath, 'utf-8');
    let buses: Bus[] = JSON.parse(data);
    
    const index = buses.findIndex(b => b.id === updatedBus.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
    }
    
    buses[index] = updatedBus;
    await fs.writeFile(dataPath, JSON.stringify(buses, null, 2));
    
    return NextResponse.json(updatedBus);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update bus' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Bus ID required' }, { status: 400 });
    }
    
    const data = await fs.readFile(dataPath, 'utf-8');
    let buses: Bus[] = JSON.parse(data);
    
    buses = buses.filter(b => b.id !== id);
    await fs.writeFile(dataPath, JSON.stringify(buses, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete bus' }, { status: 500 });
  }
}
