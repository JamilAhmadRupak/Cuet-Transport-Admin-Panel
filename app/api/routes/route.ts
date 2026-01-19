import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Route } from '@/types';

const dataPath = path.join(process.cwd(), 'data', 'routes.json');

export async function GET() {
  try {
    const data = await fs.readFile(dataPath, 'utf-8');
    const routes: Route[] = JSON.parse(data);
    return NextResponse.json(routes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read routes data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newRoute: Route = await request.json();
    const data = await fs.readFile(dataPath, 'utf-8');
    const routes: Route[] = JSON.parse(data);
    
    routes.push(newRoute);
    await fs.writeFile(dataPath, JSON.stringify(routes, null, 2));
    
    return NextResponse.json(newRoute, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create route' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedRoute: Route = await request.json();
    const data = await fs.readFile(dataPath, 'utf-8');
    let routes: Route[] = JSON.parse(data);
    
    const index = routes.findIndex(r => r.id === updatedRoute.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }
    
    routes[index] = updatedRoute;
    await fs.writeFile(dataPath, JSON.stringify(routes, null, 2));
    
    return NextResponse.json(updatedRoute);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update route' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Route ID required' }, { status: 400 });
    }
    
    const data = await fs.readFile(dataPath, 'utf-8');
    let routes: Route[] = JSON.parse(data);
    
    routes = routes.filter(r => r.id !== id);
    await fs.writeFile(dataPath, JSON.stringify(routes, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 });
  }
}
