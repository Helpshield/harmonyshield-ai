import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Play, Pause, Square, Trash2, Edit, Activity, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AppLayout } from './AppLayout';

interface ABTest {
  id: string;
  name: string;
  description?: string;
  variants: any;
  traffic_split: any;
  status: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

interface TestAssignment {
  id: string;
  test_id: string;
  variant: string;
  user_id?: string;
  session_id?: string;
  assigned_at: string;
}

const AdminABTestingPage = () => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [assignments, setAssignments] = useState<TestAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<ABTest | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    variants: ['Control', 'Variant A'],
    traffic_split: { 'Control': 50, 'Variant A': 50 },
    status: 'draft'
  });

  useEffect(() => {
    loadData();
    setupRealTimeSubscriptions();
  }, []);

  const setupRealTimeSubscriptions = () => {
    const testsChannel = supabase
      .channel('ab_tests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ab_tests' }, loadData)
      .subscribe();

    const assignmentsChannel = supabase
      .channel('ab_test_assignments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ab_test_assignments' }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(testsChannel);
      supabase.removeChannel(assignmentsChannel);
    };
  };

  const loadData = async () => {
    try {
      const [testsResponse, assignmentsResponse] = await Promise.all([
        supabase.from('ab_tests').select('*').order('created_at', { ascending: false }),
        supabase.from('ab_test_assignments').select('*')
      ]);

      if (testsResponse.error) throw testsResponse.error;
      if (assignmentsResponse.error) throw assignmentsResponse.error;

      setTests(testsResponse.data || []);
      setAssignments(assignmentsResponse.data || []);
    } catch (error) {
      console.error('Error loading A/B testing data:', error);
      toast({
        title: "Error",
        description: "Failed to load A/B testing data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateTest = async () => {
    try {
      const testData = {
        name: formData.name,
        description: formData.description,
        variants: JSON.stringify(formData.variants),
        traffic_split: JSON.stringify(formData.traffic_split),
        status: formData.status
      };

      if (editingTest) {
        const { error } = await supabase
          .from('ab_tests')
          .update(testData)
          .eq('id', editingTest.id);
        
        if (error) throw error;
        
        await supabase.rpc('log_admin_action', {
          p_action: 'UPDATE',
          p_entity_type: 'ab_test',
          p_entity_id: editingTest.id,
          p_details: { name: formData.name, status: formData.status }
        });
      } else {
        const { error } = await supabase
          .from('ab_tests')
          .insert([testData]);
        
        if (error) throw error;
        
        await supabase.rpc('log_admin_action', {
          p_action: 'CREATE',
          p_entity_type: 'ab_test',
          p_details: { name: formData.name }
        });
      }

      toast({
        title: "Success",
        description: editingTest ? "Test updated successfully" : "Test created successfully"
      });

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving test:', error);
      toast({
        title: "Error",
        description: "Failed to save test",
        variant: "destructive"
      });
    }
  };

  const updateTestStatus = async (testId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('ab_tests')
        .update({ status })
        .eq('id', testId);

      if (error) throw error;

      await supabase.rpc('log_admin_action', {
        p_action: 'UPDATE_STATUS',
        p_entity_type: 'ab_test',
        p_entity_id: testId,
        p_details: { status }
      });

      toast({
        title: "Success",
        description: `Test ${status} successfully`
      });

      loadData();
    } catch (error) {
      console.error('Error updating test status:', error);
      toast({
        title: "Error",
        description: "Failed to update test status",
        variant: "destructive"
      });
    }
  };

  const deleteTest = async (testId: string) => {
    try {
      const { error } = await supabase
        .from('ab_tests')
        .delete()
        .eq('id', testId);

      if (error) throw error;

      await supabase.rpc('log_admin_action', {
        p_action: 'DELETE',
        p_entity_type: 'ab_test',
        p_entity_id: testId
      });

      toast({
        title: "Success",
        description: "Test deleted successfully"
      });

      loadData();
    } catch (error) {
      console.error('Error deleting test:', error);
      toast({
        title: "Error",
        description: "Failed to delete test",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      variants: ['Control', 'Variant A'],
      traffic_split: { 'Control': 50, 'Variant A': 50 },
      status: 'draft'
    });
    setEditingTest(null);
  };

  const editTest = (test: ABTest) => {
    setEditingTest(test);
    setFormData({
      name: test.name,
      description: test.description || '',
      variants: Array.isArray(test.variants) ? test.variants : JSON.parse(test.variants as string),
      traffic_split: typeof test.traffic_split === 'object' ? test.traffic_split : JSON.parse(test.traffic_split as string),
      status: test.status
    });
    setDialogOpen(true);
  };

  const addVariant = () => {
    const newVariants = [...formData.variants, `Variant ${String.fromCharCode(65 + formData.variants.length - 1)}`];
    const newSplit = { ...formData.traffic_split };
    const equalSplit = Math.floor(100 / newVariants.length);
    
    newVariants.forEach(variant => {
      newSplit[variant] = equalSplit;
    });

    setFormData({ ...formData, variants: newVariants, traffic_split: newSplit });
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length <= 2) return;
    
    const newVariants = formData.variants.filter((_, i) => i !== index);
    const newSplit = { ...formData.traffic_split };
    delete newSplit[formData.variants[index]];
    
    const equalSplit = Math.floor(100 / newVariants.length);
    newVariants.forEach(variant => {
      newSplit[variant] = equalSplit;
    });

    setFormData({ ...formData, variants: newVariants, traffic_split: newSplit });
  };

  const getTestAnalytics = (testId: string) => {
    const testAssignments = assignments.filter(a => a.test_id === testId);
    const variantCounts = testAssignments.reduce((acc, assignment) => {
      acc[assignment.variant] = (acc[assignment.variant] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(variantCounts).map(([variant, count]) => ({
      variant,
      assignments: count,
      percentage: testAssignments.length > 0 ? Math.round((count / testAssignments.length) * 100) : 0
    }));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">A/B Testing</h1>
            <p className="text-muted-foreground">Manage and analyze A/B tests</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Create Test
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTest ? 'Edit Test' : 'Create New A/B Test'}</DialogTitle>
                <DialogDescription>
                  Configure your A/B test variants and traffic distribution
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Test Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Landing Page Redesign"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Test description..."
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Variants</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                      Add Variant
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.variants.map((variant, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={variant}
                          onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[index] = e.target.value;
                            setFormData({ ...formData, variants: newVariants });
                          }}
                        />
                        <Input
                          type="number"
                          value={formData.traffic_split[variant] || 0}
                          onChange={(e) => {
                            const newSplit = { ...formData.traffic_split };
                            newSplit[variant] = parseInt(e.target.value) || 0;
                            setFormData({ ...formData, traffic_split: newSplit });
                          }}
                          className="w-20"
                          min="0"
                          max="100"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                        {formData.variants.length > 2 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => removeVariant(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={createOrUpdateTest}>{editingTest ? 'Update' : 'Create'} Test</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tests.length}</div>
              <p className="text-xs text-muted-foreground">
                {tests.filter(t => t.status === 'active').length} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all tests
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
              <Play className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tests.filter(t => t.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">
                Currently running
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tests.filter(t => t.status === 'completed').length}</div>
              <p className="text-xs text-muted-foreground">
                Finished experiments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tests Table */}
        <Card>
          <CardHeader>
            <CardTitle>A/B Tests</CardTitle>
            <CardDescription>
              Manage your A/B tests and view real-time performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Assignments</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => {
                  const testAnalytics = getTestAnalytics(test.id);
                  const variants = Array.isArray(test.variants) ? test.variants : JSON.parse(test.variants as string);
                  
                  return (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.name}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(test.status)}>
                          {test.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{variants.length} variants</TableCell>
                      <TableCell>{testAnalytics.reduce((sum, v) => sum + v.assignments, 0)}</TableCell>
                      <TableCell>{new Date(test.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => editTest(test)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {test.status === 'draft' && (
                            <Button variant="outline" size="sm" onClick={() => updateTestStatus(test.id, 'active')}>
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {test.status === 'active' && (
                            <Button variant="outline" size="sm" onClick={() => updateTestStatus(test.id, 'paused')}>
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          {test.status === 'paused' && (
                            <Button variant="outline" size="sm" onClick={() => updateTestStatus(test.id, 'active')}>
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => updateTestStatus(test.id, 'completed')}>
                            <Square className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteTest(test.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Analytics Charts */}
        {tests.filter(t => t.status === 'active').length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tests.filter(t => t.status === 'active').map((test) => {
              const analytics = getTestAnalytics(test.id);
              
              return (
                <Card key={test.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                    <CardDescription>Variant distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ variant, percentage }) => `${variant}: ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="assignments"
                          >
                            {analytics.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminABTestingPage;