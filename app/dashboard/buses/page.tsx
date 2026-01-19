'use client';

import { useEffect, useState } from 'react';
import { Bus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const response = await fetch('/api/buses');
      const data = await response.json();
      setBuses(data);
    } catch (error) {
      console.error('Failed to fetch buses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const busData: Bus = {
      id: editingBus?.id || `bus-${Date.now()}`,
      name: formData.get('name') as string,
      type: formData.get('type') as 'teacher' | 'student' | 'staff',
      capacity: parseInt(formData.get('capacity') as string),
      status: formData.get('status') as 'active' | 'maintenance' | 'inactive',
      registrationNumber: formData.get('registrationNumber') as string,
      currentRoute: formData.get('currentRoute') as string || undefined,
    };

    try {
      const method = editingBus ? 'PUT' : 'POST';
      await fetch('/api/buses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(busData),
      });

      fetchBuses();
      setIsDialogOpen(false);
      setEditingBus(null);
    } catch (error) {
      console.error('Failed to save bus:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this bus?')) {
      try {
        await fetch(`/api/buses?id=${id}`, { method: 'DELETE' });
        fetchBuses();
      } catch (error) {
        console.error('Failed to delete bus:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'teacher': return 'bg-blue-500';
      case 'student': return 'bg-purple-500';
      case 'staff': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bus Management</h1>
          <p className="text-gray-500">Manage all buses in the transport fleet</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingBus(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Bus
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingBus ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
              <DialogDescription>
                {editingBus ? 'Update bus information' : 'Add a new bus to the fleet'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Bus Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingBus?.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue={editingBus?.type || 'student'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  defaultValue={editingBus?.capacity}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={editingBus?.status || 'active'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  name="registrationNumber"
                  defaultValue={editingBus?.registrationNumber}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBus ? 'Update' : 'Add'} Bus
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Teacher Buses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {buses.filter(b => b.type === 'teacher').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Student Buses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {buses.filter(b => b.type === 'student').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Buses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {buses.filter(b => b.status === 'active').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Buses</CardTitle>
          <CardDescription>Complete list of buses in the fleet</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buses.map((bus) => (
                <TableRow key={bus.id}>
                  <TableCell className="font-medium">{bus.name}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(bus.type)}>
                      {bus.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{bus.registrationNumber}</TableCell>
                  <TableCell>{bus.capacity}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(bus.status)}>
                      {bus.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingBus(bus);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(bus.id)}
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
