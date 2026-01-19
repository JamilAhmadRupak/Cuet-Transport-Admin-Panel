'use client';

import { useEffect, useState } from 'react';
import { Assignment, Bus, Route } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, busesRes, routesRes] = await Promise.all([
        fetch('/api/assignments'),
        fetch('/api/buses'),
        fetch('/api/routes')
      ]);
      
      setAssignments(await assignmentsRes.json());
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
    const isMonthly = formData.get('assignmentType') === 'monthly';
    
    const assignmentData: Assignment = {
      id: `assign-${Date.now()}`,
      busId: selectedBus,
      busName: selectedBusData?.name || '',
      passengerType: formData.get('passengerType') as 'student' | 'teacher' | 'staff',
      passengerCount: parseInt(formData.get('passengerCount') as string),
      startDate: formData.get('startDate') as string,
      endDate: isMonthly 
        ? new Date(new Date(formData.get('startDate') as string).setMonth(
            new Date(formData.get('startDate') as string).getMonth() + 1
          )).toISOString().split('T')[0]
        : formData.get('startDate') as string,
      isMonthly,
      routeId: selectedRoute,
    };

    try {
      await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData),
      });

      fetchData();
      setIsDialogOpen(false);
      setSelectedBus('');
      setSelectedRoute('');
    } catch (error) {
      console.error('Failed to create assignment:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      try {
        await fetch(`/api/assignments?id=${id}`, { method: 'DELETE' });
        fetchData();
      } catch (error) {
        console.error('Failed to delete assignment:', error);
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
          <h1 className="text-3xl font-bold">Assignment Management</h1>
          <p className="text-gray-500">Assign buses to students and teachers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Assignment</DialogTitle>
              <DialogDescription>
                Assign a bus to students or teachers
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
                        {bus.name} ({bus.type}) - Capacity: {bus.capacity}
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

              <div>
                <Label htmlFor="passengerType">Passenger Type</Label>
                <Select name="passengerType" defaultValue="student">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="passengerCount">Passenger Count</Label>
                <Input
                  id="passengerCount"
                  name="passengerCount"
                  type="number"
                  min="1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="assignmentType">Assignment Type</Label>
                <Select name="assignmentType" defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily (Single Day)</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Assignment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {assignments.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {assignments.filter(a => a.isMonthly).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Passengers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {assignments.reduce((sum, a) => sum + a.passengerCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
          <CardDescription>Current bus assignments for students and teachers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bus</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Passengers</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.busName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {assignment.passengerType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-500" />
                      {assignment.passengerCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    {routes.find(r => r.id === assignment.routeId)?.name || assignment.routeId}
                  </TableCell>
                  <TableCell>
                    <Badge className={assignment.isMonthly ? 'bg-purple-500' : 'bg-blue-500'}>
                      {assignment.isMonthly ? 'Monthly' : 'Daily'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(assignment.startDate), 'MMM dd, yyyy')}
                    {' → '}
                    {format(new Date(assignment.endDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(assignment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
