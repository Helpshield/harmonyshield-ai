import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Eye, 
  Play, 
  CheckCircle, 
  XCircle,
  AlertTriangle 
} from 'lucide-react';

interface ProgressUpdate {
  id: string;
  status: string;
  message: string;
  timestamp: string;
  admin_notes?: string;
}

interface ProgressTimelineProps {
  updates: ProgressUpdate[];
  currentStatus: string;
}

const ProgressTimeline: React.FC<ProgressTimelineProps> = ({ updates, currentStatus }) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4" />,
          color: 'bg-yellow-500',
          label: 'Pending Review',
          bgColor: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'
        };
      case 'investigating':
        return {
          icon: <Eye className="h-4 w-4" />,
          color: 'bg-blue-500',
          label: 'Under Investigation',
          bgColor: 'bg-blue-500/10 text-blue-700 border-blue-500/20'
        };
      case 'in_progress':
        return {
          icon: <Play className="h-4 w-4" />,
          color: 'bg-purple-500',
          label: 'Recovery in Progress',
          bgColor: 'bg-purple-500/10 text-purple-700 border-purple-500/20'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'bg-green-500',
          label: 'Recovery Completed',
          bgColor: 'bg-green-500/10 text-green-700 border-green-500/20'
        };
      case 'closed':
        return {
          icon: <XCircle className="h-4 w-4" />,
          color: 'bg-gray-500',
          label: 'Case Closed',
          bgColor: 'bg-gray-500/10 text-gray-700 border-gray-500/20'
        };
      default:
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          color: 'bg-gray-400',
          label: status.replace('_', ' '),
          bgColor: 'bg-gray-500/10 text-gray-700 border-gray-500/20'
        };
    }
  };

  const timelineSteps = [
    { status: 'pending', title: 'Request Submitted', description: 'Your recovery request has been received' },
    { status: 'investigating', title: 'Investigation Started', description: 'Our team is analyzing your case' },
    { status: 'in_progress', title: 'Recovery in Progress', description: 'Active recovery efforts are underway' },
    { status: 'completed', title: 'Recovery Completed', description: 'Your assets have been successfully recovered' }
  ];

  const getStepStatus = (stepStatus: string) => {
    const statusOrder = ['pending', 'investigating', 'in_progress', 'completed', 'closed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);
    
    if (stepIndex <= currentIndex) return 'completed';
    if (stepIndex === currentIndex + 1) return 'current';
    return 'upcoming';
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recovery Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {timelineSteps.map((step, index) => {
              const stepStatus = getStepStatus(step.status);
              const statusInfo = getStatusInfo(step.status);
              
              return (
                <div key={step.status} className="relative flex items-start pb-8 last:pb-0">
                  {/* Connection Line */}
                  {index < timelineSteps.length - 1 && (
                    <div className={`absolute left-4 top-8 w-0.5 h-8 ${
                      stepStatus === 'completed' ? 'bg-primary' : 'bg-border'
                    }`} />
                  )}
                  
                  {/* Step Icon */}
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    stepStatus === 'completed' 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : stepStatus === 'current'
                      ? 'bg-background border-primary text-primary'
                      : 'bg-background border-border text-muted-foreground'
                  }`}>
                    {stepStatus === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      statusInfo.icon
                    )}
                  </div>
                  
                  {/* Step Content */}
                  <div className="ml-4 flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className={`text-sm font-medium ${
                        stepStatus === 'completed' || stepStatus === 'current'
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </h4>
                      {stepStatus === 'current' && (
                        <Badge className={statusInfo.bgColor}>
                          {statusInfo.label}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Updates */}
      {updates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {updates.map((update, index) => {
                const statusInfo = getStatusInfo(update.status);
                
                return (
                  <div key={update.id} className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${statusInfo.color}`}>
                      {statusInfo.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={statusInfo.bgColor}>
                          {statusInfo.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(update.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-2">{update.message}</p>
                      {update.admin_notes && (
                        <div className="bg-background/50 p-3 rounded border-l-2 border-primary">
                          <p className="text-xs text-muted-foreground mb-1">Admin Notes:</p>
                          <p className="text-sm">{update.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressTimeline;