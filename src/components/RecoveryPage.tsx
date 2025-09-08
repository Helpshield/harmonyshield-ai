import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from './AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  DollarSign, 
  CreditCard, 
  Bitcoin, 
  Shield, 
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CashRecoveryForm from './recovery/CashRecoveryForm';
import CardsRecoveryForm from './recovery/CardsRecoveryForm';
import CryptoRecoveryForm from './recovery/CryptoRecoveryForm';
import ProgressTimeline from './ProgressTimeline';

const RecoveryPage = () => {
  const [user, setUser] = useState(null);
  const [recoveryRequests, setRecoveryRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      
      setUser(session.user);
      await loadRecoveryRequests(session.user.id);
      setLoading(false);
    };

    checkAuth();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('recovery-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recovery_requests'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' && user) {
            loadRecoveryRequests(user.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate, user]);

  const loadRecoveryRequests = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('recovery_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

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
        return <DollarSign className="h-4 w-4" />;
      case 'cards':
        return <CreditCard className="h-4 w-4" />;
      case 'crypto':
        return <Bitcoin className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

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
            Asset Recovery Center
          </h1>
          <p className="text-muted-foreground">
            Recover your lost or stolen digital and physical assets with our expert assistance
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="cash" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Cash</span>
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Cards</span>
            </TabsTrigger>
            <TabsTrigger value="crypto" className="flex items-center space-x-2">
              <Bitcoin className="h-4 w-4" />
              <span>Crypto</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Progress</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover-lift shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span>Cash Recovery</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    Recover funds lost through bank fraud, unauthorized transfers, or payment scams
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab('cash')}
                    className="w-full"
                  >
                    Start Cash Recovery
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover-lift shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <span>Cards Recovery</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    Recover funds from unauthorized card transactions, skimming, or identity theft
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab('cards')}
                    className="w-full"
                  >
                    Start Cards Recovery
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover-lift shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                    <Bitcoin className="h-5 w-5 text-orange-600" />
                    <span>Crypto Recovery</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    Recover cryptocurrency lost through scams, exchange hacks, or wallet compromises
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab('crypto')}
                    className="w-full"
                  >
                    Start Crypto Recovery
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recovery Requests History */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Your Recovery Requests</span>
                </CardTitle>
                <CardDescription>
                  Track the progress of your asset recovery cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recoveryRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recovery requests yet</p>
                    <p className="text-xs text-muted-foreground">Start by submitting a recovery request using the tabs above</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recoveryRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getRecoveryIcon(request.recovery_type)}
                              <span className="capitalize">{request.recovery_type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{request.title}</TableCell>
                          <TableCell>
                            {request.amount_lost ? `${request.currency || '$'}${parseFloat(request.amount_lost).toLocaleString()}` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(request.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setActiveTab('details');
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recovery Forms */}
          <TabsContent value="cash">
            <CashRecoveryForm onSubmitSuccess={() => {
              loadRecoveryRequests(user.id);
              setActiveTab('overview');
            }} />
          </TabsContent>

          <TabsContent value="cards">
            <CardsRecoveryForm onSubmitSuccess={() => {
              loadRecoveryRequests(user.id);
              setActiveTab('overview');
            }} />
          </TabsContent>

          <TabsContent value="crypto">
            <CryptoRecoveryForm onSubmitSuccess={() => {
              loadRecoveryRequests(user.id);
              setActiveTab('overview');
            }} />
          </TabsContent>

          {/* Progress Details Tab */}
          <TabsContent value="details">
            {selectedRequest ? (
              <div className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{getRecoveryIcon(selectedRequest.recovery_type)}</span>
                      <span>{selectedRequest.title}</span>
                      <Badge className={getStatusColor(selectedRequest.status)}>
                        {selectedRequest.status.replace('_', ' ')}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Submitted on {new Date(selectedRequest.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-medium mb-2">Case Details</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Type:</strong> {selectedRequest.recovery_type.charAt(0).toUpperCase() + selectedRequest.recovery_type.slice(1)}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Amount:</strong> {selectedRequest.amount_lost ? `${selectedRequest.currency || '$'}${parseFloat(selectedRequest.amount_lost).toLocaleString()}` : 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Description:</strong> {selectedRequest.description}
                        </p>
                      </div>
                      {selectedRequest.evidence_files && selectedRequest.evidence_files.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Evidence Files</h4>
                          <div className="space-y-2">
                            {selectedRequest.evidence_files.map((file, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <FileText className="h-4 w-4" />
                                <span>Evidence file {index + 1}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <ProgressTimeline 
                  updates={selectedRequest.progress_updates || []}
                  currentStatus={selectedRequest.status}
                />
              </div>
            ) : (
              <Card className="shadow-card">
                <CardContent className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a recovery request from the overview to view progress details</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default RecoveryPage;