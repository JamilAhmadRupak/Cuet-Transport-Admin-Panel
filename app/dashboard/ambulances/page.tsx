'use client';

import { useEffect, useState } from 'react';
import { Ambulance } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Phone } from 'lucide-react';

export default function AmbulancesPage() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAmbulance, setEditingAmbulance] = useState<Ambulance | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    try {
      const response = await fetch('/api/ambulances');
      const data = await response.json();
      setAmbulances(data);
    } catch (error) {
      console.error('Failed to fetch ambulances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const ambulanceData: Ambulance = {
      id: editingAmbulance!.id,
      name: editingAmbulance!.name,
      status: formData.get('status') as 'active' | 'maintenance' | 'inactive',
      emergencyContact: formData.get('emergencyContact') as string,
    };

    try {
      await fetch('/api/ambulances', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ambulanceData),
      });

      fetchAmbulances();
      setIsDialogOpen(false);
      setEditingAmbulance(null);
    } catch (error) {
      console.error('Failed to update ambulance:', error);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ambulance Management</h1>
        <p className="text-gray-500">Manage ambulances and emergency contacts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Ambulances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {ambulances.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {ambulances.filter(a => a.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Under Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {ambulances.filter(a => a.status === 'maintenance').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ambulances.map((ambulance) => (
          <Card key={ambulance.id} className="border-red-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{ambulance.name}</CardTitle>
                  <CardDescription className="mt-2">
                    <Badge className={getStatusColor(ambulance.status)}>
                      {ambulance.status}
                    </Badge>
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingAmbulance(ambulance);
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-mono">{ambulance.emergencyContact}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Ambulance</DialogTitle>
            <DialogDescription>
              Update ambulance status and emergency contact
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Ambulance</Label>
              <Input value={editingAmbulance?.name} disabled />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={editingAmbulance?.status}>
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
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                name="emergencyContact"
                defaultValue={editingAmbulance?.emergencyContact}
                required
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Update Ambulance
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
