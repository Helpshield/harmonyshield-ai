import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from './AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Shield, 
  DollarSign,
  CreditCard,
  Bitcoin,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const AdminRecoveryJobsPage = () => {
  const [user, setUser] = useState(null);
  const [recoveryRequests, setRecoveryRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('user');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [progressUpdate, setProgressUpdate] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      
      setUser(session.user);
      
      // Check if user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      if (!roleData || !['admin', 'moderator'].includes(roleData.role)) {
        navigate('/dashboard');
        return;
      }
      
      setUserRole(roleData.role);
      setLoading(false);
      loadRecoveryRequests();
    };

    checkAdminAccess();
  }, [navigate]);

  const loadRecoveryRequests = async () => {
    try {
      let query = supabase
        .from('recovery_requests')
        .select(`
          *,
          profiles!recovery_requests_user_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setRecoveryRequests(data || []);
    } catch (error) {
      console.error('Error loading recovery requests:', error);
      toast({
        title: "Error",
        description: "Failed to load recovery requests",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'investigating':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'in_progress':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'closed':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getRecoveryIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'cards':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'crypto':
        return <Bitcoin className="h-4 w-4 text-orange-600" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const handleUpdateProgress = async () => {
    if (!selectedRequest || !progressUpdate.trim()) {
      toast({
        title: "Error",
        description: "Please provide a progress update",
        variant: "destructive",
      });
      return;
    }

    try {
      const currentUpdates = selectedRequest.progress_updates || [];
      const newUpdate = {
        timestamp: new Date().toISOString(),
        admin_id: user.id,
        message: progressUpdate,
      };

      const updates: any = {
        progress_updates: [...currentUpdates, newUpdate],
        assigned_admin_id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (statusUpdate) {
        updates.status = statusUpdate;
      }

      if (adminNotes.trim()) {
        updates.admin_notes = adminNotes;
      }

      const { error } = await supabase
        .from('recovery_requests')
        .update(updates)
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recovery request updated successfully",
      });

      setUpdateDialogOpen(false);
      setProgressUpdate('');
      setStatusUpdate('');
      setAdminNotes('');
      setSelectedRequest(null);
      loadRecoveryRequests();

    } catch (error) {
      console.error('Error updating recovery request:', error);
      toast({
        title: "Error",
        description: "Failed to update recovery request",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = recoveryRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (request.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.recovery_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStats = () => {
    const total = recoveryRequests.length;
    const pending = recoveryRequests.filter(r => r.status === 'pending').length;
    const inProgress = recoveryRequests.filter(r => r.status === 'in_progress' || r.status === 'investigating').length;
    const completed = recoveryRequests.filter(r => r.status === 'completed').length;
    
    return { total, pending, inProgress, completed };
  };

  const stats = getStats();

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-shield-pulse">
            <Shield className="h-12 w-12 text-primary" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Recovery Jobs Management
          </h1>
          <p className="text-muted-foreground">
            Manage and track asset recovery requests from users
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover-lift shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="hover-lift shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="hover-lift shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertTriangle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card className="hover-lift shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cash">Cash Recovery</SelectItem>
                  <SelectItem value="cards">Cards Recovery</SelectItem>
                  <SelectItem value="crypto">Crypto Recovery</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={loadRecoveryRequests}>
                <Filter className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recovery Requests Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recovery Requests</span>
              <Badge variant="secondary">{filteredRequests.length} requests</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recovery requests found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getRecoveryIcon(request.recovery_type)}
                          <span className="capitalize">{request.recovery_type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-xs">
                        <div className="truncate" title={request.title}>
                          {request.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{request.profiles?.full_name || 'Unknown User'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.amount_lost ? `${request.currency || '$'}${parseFloat(request.amount_lost).toLocaleString()}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog open={updateDialogOpen && selectedRequest?.id === request.id} onOpenChange={(open) => {
                            setUpdateDialogOpen(open);
                            if (open) {
                              setSelectedRequest(request);
                              setStatusUpdate(request.status);
                              setAdminNotes(request.admin_notes || '');
                            } else {
                              setSelectedRequest(null);
                              setProgressUpdate('');
                              setStatusUpdate('');
                              setAdminNotes('');
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Update
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Update Recovery Request</DialogTitle>
                                <DialogDescription>
                                  Update the status and add progress notes for this recovery case.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                {/* Request Details */}
                                <div className="p-4 bg-muted/50 rounded-lg">
                                  <h4 className="font-medium mb-2">{request.title}</h4>
                                  <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                                  <div className="flex items-center space-x-4 text-sm">
                                    <span><strong>User:</strong> {request.profiles?.full_name}</span>
                                    <span><strong>Type:</strong> {request.recovery_type}</span>
                                    <span><strong>Amount:</strong> {request.amount_lost ? `${request.currency}${request.amount_lost}` : 'N/A'}</span>
                                  </div>
                                </div>

                                {/* Status Update */}
                                <div>
                                  <Label htmlFor="status">Status</Label>
                                  <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="investigating">Investigating</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Progress Update */}
                                <div>
                                  <Label htmlFor="progress">Progress Update</Label>
                                  <Textarea
                                    id="progress"
                                    placeholder="Enter progress update for the user..."
                                    value={progressUpdate}
                                    onChange={(e) => setProgressUpdate(e.target.value)}
                                    className="min-h-[100px]"
                                  />
                                </div>

                                {/* Admin Notes */}
                                <div>
                                  <Label htmlFor="notes">Admin Notes (Internal)</Label>
                                  <Textarea
                                    id="notes"
                                    placeholder="Internal admin notes (not visible to user)..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                  />
                                </div>

                                {/* Previous Updates */}
                                {request.progress_updates && request.progress_updates.length > 0 && (
                                  <div>
                                    <Label>Previous Updates</Label>
                                    <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-muted/30 rounded-lg">
                                      {request.progress_updates.map((update, index) => (
                                        <div key={index} className="text-sm">
                                          <div className="font-medium text-xs text-muted-foreground">
                                            {new Date(update.timestamp).toLocaleString()}
                                          </div>
                                          <div>{update.message}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <DialogFooter>
                                <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleUpdateProgress}>
                                  Update Request
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminRecoveryJobsPage;