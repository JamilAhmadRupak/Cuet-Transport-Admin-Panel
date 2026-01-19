'use client';

import { useEffect, useState } from 'react';
import { Route } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, MapPin, Clock } from 'lucide-react';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/routes');
      const data = await response.json();
      setRoutes(data);
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const stopsText = formData.get('stops') as string;
    const stops = stopsText.split('\n').filter(s => s.trim());

    const routeData: Route = {
      id: editingRoute?.id || `route-${Date.now()}`,
      name: formData.get('name') as string,
      startPoint: formData.get('startPoint') as string,
      endPoint: formData.get('endPoint') as string,
      stops,
      distance: formData.get('distance') as string,
      estimatedTime: formData.get('estimatedTime') as string,
      assignedBuses: editingRoute?.assignedBuses || [],
    };

    try {
      const method = editingRoute ? 'PUT' : 'POST';
      await fetch('/api/routes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeData),
      });

      fetchRoutes();
      setIsDialogOpen(false);
      setEditingRoute(null);
    } catch (error) {
      console.error('Failed to save route:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this route?')) {
      try {
        await fetch(`/api/routes?id=${id}`, { method: 'DELETE' });
        fetchRoutes();
      } catch (error) {
        console.error('Failed to delete route:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Route Management</h1>
          <p className="text-gray-500">Manage all bus routes between CUET and Old Railway Station</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingRoute(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Route
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRoute ? 'Edit Route' : 'Add New Route'}</DialogTitle>
              <DialogDescription>
                {editingRoute ? 'Update route information' : 'Create a new route'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Route Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingRoute?.name}
                  placeholder="e.g., Route A"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startPoint">Start Point</Label>
                  <Input
                    id="startPoint"
                    name="startPoint"
                    defaultValue={editingRoute?.startPoint}
                    placeholder="CUET Main Gate"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endPoint">End Point</Label>
                  <Input
                    id="endPoint"
                    name="endPoint"
                    defaultValue={editingRoute?.endPoint}
                    placeholder="Old Railway Station"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="stops">Stops (one per line)</Label>
                <Textarea
                  id="stops"
                  name="stops"
                  defaultValue={editingRoute?.stops.join('\n')}
                  placeholder="CUET Main Gate&#10;Oxygen Intersection&#10;Tiger Pass&#10;..."
                  rows={6}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="distance">Distance</Label>
                  <Input
                    id="distance"
                    name="distance"
                    defaultValue={editingRoute?.distance}
                    placeholder="12 km"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedTime">Estimated Time</Label>
                  <Input
                    id="estimatedTime"
                    name="estimatedTime"
                    defaultValue={editingRoute?.estimatedTime}
                    placeholder="35 minutes"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRoute ? 'Update' : 'Add'} Route
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {routes.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Buses Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {routes.reduce((sum, r) => sum + r.assignedBuses.length, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Stops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {routes.length > 0 ? Math.round(routes.reduce((sum, r) => sum + r.stops.length, 0) / routes.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {routes.map((route) => (
          <Card key={route.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{route.name}</CardTitle>
                  <CardDescription className="mt-1 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {route.startPoint} → {route.endPoint}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingRoute(route);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(route.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{route.distance}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{route.estimatedTime}</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Stops ({route.stops.length})</h4>
                <div className="space-y-1">
                  {route.stops.slice(0, 4).map((stop, idx) => (
                    <div key={idx} className="text-sm text-gray-600 flex items-center">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center mr-2">
                        {idx + 1}
                      </span>
                      {stop}
                    </div>
                  ))}
                  {route.stops.length > 4 && (
                    <div className="text-sm text-gray-500 ml-8">
                      +{route.stops.length - 4} more stops
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">
                  Assigned Buses ({route.assignedBuses.length})
                </h4>
                {route.assignedBuses.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {route.assignedBuses.map((busId) => (
                      <span key={busId} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {busId}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No buses assigned</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
