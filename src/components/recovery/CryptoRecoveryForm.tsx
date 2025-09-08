import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bitcoin, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const cryptoRecoverySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Please provide a detailed description (minimum 10 characters)'),
  incidentDate: z.string().min(1, 'Incident date is required'),
  amountLost: z.string().min(1, 'Amount is required'),
  currency: z.string().min(1, 'Cryptocurrency type is required'),
  walletAddress: z.string().min(1, 'Wallet address is required'),
  transactionHash: z.string().optional(),
  blockchainNetwork: z.string().min(1, 'Blockchain network is required'),
  exchangeName: z.string().optional(),
  scamType: z.string().min(1, 'Scam type is required'),
  scammerContact: z.string().optional(),
  recoveryMethod: z.string().optional(),
  contactMethod: z.string().min(1, 'Preferred contact method is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().min(1, 'Phone number is required'),
  policeReport: z.string().optional(),
  evidenceDescription: z.string().optional(),
});

type CryptoRecoveryFormData = z.infer<typeof cryptoRecoverySchema>;

interface CryptoRecoveryFormProps {
  onSubmitSuccess: () => void;
}

const CryptoRecoveryForm = ({ onSubmitSuccess }: CryptoRecoveryFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CryptoRecoveryFormData>({
    resolver: zodResolver(cryptoRecoverySchema),
    defaultValues: {
      contactMethod: 'email',
      currency: 'BTC',
      blockchainNetwork: 'Bitcoin',
    },
  });

  const onSubmit = async (data: CryptoRecoveryFormData) => {
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase.from('recovery_requests').insert({
        user_id: session.user.id,
        recovery_type: 'crypto',
        title: data.title,
        description: data.description,
        incident_date: new Date(data.incidentDate).toISOString(),
        amount_lost: parseFloat(data.amountLost),
        currency: data.currency,
        wallet_address: data.walletAddress,
        transaction_hash: data.transactionHash,
        blockchain_network: data.blockchainNetwork,
        contact_method: data.contactMethod,
        contact_details: {
          email: data.contactEmail,
          phone: data.contactPhone,
          exchange_name: data.exchangeName,
          scam_type: data.scamType,
          scammer_contact: data.scammerContact,
          recovery_method: data.recoveryMethod,
        },
        admin_notes: data.policeReport ? `Police Report: ${data.policeReport}` : '',
        evidence_files: data.evidenceDescription ? [data.evidenceDescription] : [],
      });

      if (error) throw error;

      toast({
        title: "Recovery Request Submitted",
        description: "Your crypto recovery request has been submitted successfully. Our blockchain specialists will review it shortly.",
      });

      form.reset();
      onSubmitSuccess();

    } catch (error) {
      console.error('Error submitting recovery request:', error);
      toast({
        title: "Error",
        description: "Failed to submit recovery request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bitcoin className="h-6 w-6 text-orange-600" />
          <span>Crypto Recovery Request</span>
        </CardTitle>
        <CardDescription>
          Submit a request to recover cryptocurrency lost through scams, exchange hacks, or wallet compromises
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important Notice:</strong> Cryptocurrency transactions are irreversible by nature. Recovery success depends on various factors including the type of incident, timing, and available evidence. Our specialists will assess the best possible recovery options for your case.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Incident Details</h3>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of the crypto loss incident" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe how the loss occurred, including any interactions with scammers, exchanges, or wallets"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="incidentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="amountLost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount Lost</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.00000001" placeholder="0.00000000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cryptocurrency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                            <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                            <SelectItem value="USDT">Tether (USDT)</SelectItem>
                            <SelectItem value="BNB">Binance Coin (BNB)</SelectItem>
                            <SelectItem value="XRP">Ripple (XRP)</SelectItem>
                            <SelectItem value="ADA">Cardano (ADA)</SelectItem>
                            <SelectItem value="SOL">Solana (SOL)</SelectItem>
                            <SelectItem value="DOT">Polkadot (DOT)</SelectItem>
                            <SelectItem value="MATIC">Polygon (MATIC)</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Blockchain Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Blockchain Information</h3>
              
              <FormField
                control={form.control}
                name="blockchainNetwork"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blockchain Network</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Bitcoin">Bitcoin</SelectItem>
                        <SelectItem value="Ethereum">Ethereum</SelectItem>
                        <SelectItem value="Binance Smart Chain">Binance Smart Chain</SelectItem>
                        <SelectItem value="Polygon">Polygon</SelectItem>
                        <SelectItem value="Solana">Solana</SelectItem>
                        <SelectItem value="Cardano">Cardano</SelectItem>
                        <SelectItem value="Polkadot">Polkadot</SelectItem>
                        <SelectItem value="Avalanche">Avalanche</SelectItem>
                        <SelectItem value="Tron">Tron</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="walletAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Wallet Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Your wallet address where funds were lost from" {...field} />
                    </FormControl>
                    <FormDescription>The address that the funds were sent from or stolen from</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transactionHash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Hash (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Transaction ID/Hash if available" {...field} />
                    </FormControl>
                    <FormDescription>The transaction hash of the fraudulent or compromised transaction</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Scam/Loss Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Loss Details</h3>
              
              <FormField
                control={form.control}
                name="scamType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Loss/Scam</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select loss type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="investment_scam">Investment Scam</SelectItem>
                        <SelectItem value="romance_scam">Romance Scam</SelectItem>
                        <SelectItem value="fake_exchange">Fake Exchange</SelectItem>
                        <SelectItem value="phishing">Phishing Attack</SelectItem>
                        <SelectItem value="wallet_hack">Wallet Compromise</SelectItem>
                        <SelectItem value="exchange_hack">Exchange Hack</SelectItem>
                        <SelectItem value="mining_scam">Mining Scam</SelectItem>
                        <SelectItem value="defi_exploit">DeFi Protocol Exploit</SelectItem>
                        <SelectItem value="rug_pull">Rug Pull</SelectItem>
                        <SelectItem value="malware">Malware/Virus</SelectItem>
                        <SelectItem value="sim_swap">SIM Swap</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="exchangeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exchange/Platform Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Name of exchange or platform involved" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scammerContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scammer Contact Info (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Email, phone, social media handle, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="recoveryMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Recovery Method (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="If you have any specific recovery preferences or methods in mind, describe them here"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              
              <FormField
                control={form.control}
                name="contactMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Contact Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="both">Both Email and Phone</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              
              <FormField
                control={form.control}
                name="policeReport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Police Report Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Police report reference number if filed" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="evidenceDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evidence Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe any evidence you have (screenshots, chat logs, emails, blockchain explorer links, etc.)"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset Form
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Recovery Request'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CryptoRecoveryForm;