'use client';

import { useEffect, useState } from 'react';
import { Bus, Ambulance, Route, Assignment, Schedule } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bus as BusIcon, Ambulance as AmbulanceIcon, Route as RouteIcon, Users, Calendar, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [busesRes, ambulancesRes, routesRes, assignmentsRes, schedulesRes] = await Promise.all([
        fetch('/api/buses'),
        fetch('/api/ambulances'),
        fetch('/api/routes'),
        fetch('/api/assignments'),
        fetch('/api/schedules')
      ]);
      
      setBuses(await busesRes.json());
      setAmbulances(await ambulancesRes.json());
      setRoutes(await routesRes.json());
      setAssignments(await assignmentsRes.json());
      setSchedules(await schedulesRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const activeBuses = buses.filter(b => b.status === 'active').length;
  const activeAmbulances = ambulances.filter(a => a.status === 'active').length;
  const totalPassengers = assignments.reduce((sum, a) => sum + a.passengerCount, 0);
  const activeSchedules = schedules.filter(s => s.isActive).length;

  const todaySchedules = schedules.filter(s => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return s.days.includes(today) && s.isActive;
  }).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-gray-500">CUET Transport Management System</p>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Buses</CardTitle>
              <BusIcon className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{buses.length}</div>
            <p className="text-xs text-gray-600 mt-1">{activeBuses} active</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Ambulances</CardTitle>
              <AmbulanceIcon className="w-5 h-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{ambulances.length}</div>
            <p className="text-xs text-gray-600 mt-1">{activeAmbulances} available</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Active Routes</CardTitle>
              <RouteIcon className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{routes.length}</div>
            <p className="text-xs text-gray-600 mt-1">CUET ↔ Old Railway Station</p>
          </CardContent>
        </Card>

        {/* <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Passengers</CardTitle>
              <Users className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalPassengers}</div>
            <p className="text-xs text-gray-600 mt-1">{assignments.length} assignments</p>
          </CardContent>
        </Card> */}
      </div>

      {/* Bus Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bus Fleet Overview</CardTitle>
            <CardDescription>Distribution by type and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <BusIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Teacher Buses</p>
                    <p className="text-sm text-gray-500">For faculty members</p>
                  </div>
                </div>
                <Badge className="bg-blue-600">
                  {buses.filter(b => b.type === 'teacher').length}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <BusIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Student Buses</p>
                    <p className="text-sm text-gray-500">For students</p>
                  </div>
                </div>
                <Badge className="bg-purple-600">
                  {buses.filter(b => b.type === 'student').length}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <BusIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Staff Buses</p>
                    <p className="text-sm text-gray-500">For staff members</p>
                  </div>
                </div>
                <Badge className="bg-orange-600">
                  {buses.filter(b => b.type === 'staff').length}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active Buses</span>
                <span className="font-semibold text-green-600">{activeBuses}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Under Maintenance</span>
                <span className="font-semibold text-yellow-600">
                  {buses.filter(b => b.status === 'maintenance').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Active bus schedules for today</CardDescription>
          </CardHeader>
          <CardContent>
            {todaySchedules.length > 0 ? (
              <div className="space-y-3">
                {todaySchedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{schedule.busName}</p>
                        <p className="text-sm text-gray-500">{schedule.routeName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold">{schedule.departureTime}</p>
                      <p className="text-xs text-gray-500">Departure</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No schedules for today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
            <CardDescription>Latest bus assignments to students and teachers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{assignment.busName}</p>
                      <p className="text-sm text-gray-500">
                        {assignment.passengerCount} {assignment.passengerType}s
                      </p>
                    </div>
                  </div>
                  <Badge className={assignment.isMonthly ? 'bg-purple-500' : 'bg-blue-500'}>
                    {assignment.isMonthly ? 'Monthly' : 'Daily'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/buses">
              <Button variant="outline" className="w-full justify-start">
                <BusIcon className="w-4 h-4 mr-2" />
                Manage Buses
              </Button>
            </Link>
            <Link href="/dashboard/routes">
              <Button variant="outline" className="w-full justify-start">
                <RouteIcon className="w-4 h-4 mr-2" />
                Manage Routes
              </Button>
            </Link>
            <Link href="/dashboard/assignments">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                New Assignment
              </Button>
            </Link>
            <Link href="/dashboard/schedules">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                View Schedules
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>System Statistics</CardTitle>
          <CardDescription>Overall transport management metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{buses.length}</div>
              <p className="text-sm text-gray-600 mt-1">Total Buses</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{routes.length}</div>
              <p className="text-sm text-gray-600 mt-1">Active Routes</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{activeSchedules}</div>
              <p className="text-sm text-gray-600 mt-1">Active Schedules</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{assignments.length}</div>
              <p className="text-sm text-gray-600 mt-1">Total Assignments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
