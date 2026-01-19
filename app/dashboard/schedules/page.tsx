'use client';

import { useEffect, useState } from 'react';
import { Schedule, Bus, Route } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schedulesRes, busesRes, routesRes] = await Promise.all([
        fetch('/api/schedules'),
        fetch('/api/buses'),
        fetch('/api/routes')
      ]);
      
      setSchedules(await schedulesRes.json());
      setBuses(await busesRes.json());
      setRoutes(await routesRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const selectedBusData = buses.find(b => b.id === selectedBus);
    const selectedRouteData = routes.find(r => r.id === selectedRoute);
    
    const scheduleData: Schedule = {
      id: editingSchedule?.id || `sched-${Date.now()}`,
      busId: selectedBus,
      busName: selectedBusData?.name || '',
      routeId: selectedRoute,
      routeName: selectedRouteData?.name || '',
      departureTime: formData.get('departureTime') as string,
      arrivalTime: formData.get('arrivalTime') as string,
      days: selectedDays,
      isActive: formData.get('isActive') === 'true',
    };

    try {
      const method = editingSchedule ? 'PUT' : 'POST';
      await fetch('/api/schedules', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      });

      fetchData();
      setIsDialogOpen(false);
      setEditingSchedule(null);
      setSelectedBus('');
      setSelectedRoute('');
      setSelectedDays([]);
    } catch (error) {
      console.error('Failed to save schedule:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      try {
        await fetch(`/api/schedules?id=${id}`, { method: 'DELETE' });
        fetchData();
      } catch (error) {
        console.error('Failed to delete schedule:', error);
      }
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const openEditDialog = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setSelectedBus(schedule.busId);
    setSelectedRoute(schedule.routeId);
    setSelectedDays(schedule.days);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingSchedule(null);
    setSelectedBus('');
    setSelectedRoute('');
    setSelectedDays([]);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Schedule Management</h1>
          <p className="text-gray-500">Manage bus schedules and timings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}</DialogTitle>
              <DialogDescription>
                {editingSchedule ? 'Update schedule information' : 'Create a new bus schedule'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="bus">Select Bus</Label>
                <Select 
                  value={selectedBus} 
                  onValueChange={setSelectedBus}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {buses.filter(b => b.status === 'active').map((bus) => (
                      <SelectItem key={bus.id} value={bus.id}>
                        {bus.name} ({bus.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="route">Select Route</Label>
                <Select 
                  value={selectedRoute} 
                  onValueChange={setSelectedRoute}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a route" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departureTime">Departure Time</Label>
                  <Input
                    id="departureTime"
                    name="departureTime"
                    type="time"
                    defaultValue={editingSchedule?.departureTime}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="arrivalTime">Arrival Time</Label>
                  <Input
                    id="arrivalTime"
                    name="arrivalTime"
                    type="time"
                    defaultValue={editingSchedule?.arrivalTime}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Operating Days</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {DAYS.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={selectedDays.includes(day) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDay(day)}
                    >
                      {day.substring(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="isActive">Status</Label>
                <Select name="isActive" defaultValue={editingSchedule?.isActive ? 'true' : 'false'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={selectedDays.length === 0}>
                  {editingSchedule ? 'Update' : 'Add'} Schedule
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {schedules.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {schedules.filter(s => s.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekday Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {schedules.filter(s => s.days.includes('Monday')).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekend Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {schedules.filter(s => s.days.includes('Saturday') || s.days.includes('Sunday')).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Schedules</CardTitle>
          <CardDescription>Bus schedules and timings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bus</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.busName}</TableCell>
                  <TableCell>{schedule.routeName}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      {schedule.departureTime}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      {schedule.arrivalTime}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {schedule.days.slice(0, 3).map(day => (
                        <Badge key={day} variant="outline" className="text-xs">
                          {day.substring(0, 3)}
                        </Badge>
                      ))}
                      {schedule.days.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{schedule.days.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={schedule.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                      {schedule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(schedule)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(schedule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
