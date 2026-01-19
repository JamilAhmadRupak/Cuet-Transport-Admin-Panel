import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Ambulance } from '@/types';

const dataPath = path.join(process.cwd(), 'data', 'ambulances.json');

export async function GET() {
  try {
    const data = await fs.readFile(dataPath, 'utf-8');
    const ambulances: Ambulance[] = JSON.parse(data);
    return NextResponse.json(ambulances);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read ambulances data' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedAmbulance: Ambulance = await request.json();
    const data = await fs.readFile(dataPath, 'utf-8');
    let ambulances: Ambulance[] = JSON.parse(data);
    
    const index = ambulances.findIndex(a => a.id === updatedAmbulance.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Ambulance not found' }, { status: 404 });
    }
    
    ambulances[index] = updatedAmbulance;
    await fs.writeFile(dataPath, JSON.stringify(ambulances, null, 2));
    
    return NextResponse.json(updatedAmbulance);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update ambulance' }, { status: 500 });
  }
}
