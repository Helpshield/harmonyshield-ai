import { Mail, Bell, CheckCircle, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicLayout } from "./PublicLayout";
import { useState } from "react";
import { toast } from "sonner";

const NewsletterPage = () => {
  const [email, setEmail] = useState("");
  const [preferences, setPreferences] = useState({
    scamAlerts: true,
    weeklyDigest: true,
    productUpdates: false,
    securityTips: true
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Successfully subscribed to security updates!");
    setEmail("");
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="mb-4">← Back to Home</Button>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Security Newsletter</h1>
            </div>
            <p className="text-muted-foreground">
              Stay informed about the latest scams, security threats, and protection tips
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Bell className="h-6 w-6 text-primary" />
                  <CardTitle>What You'll Receive</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Real-time Scam Alerts</p>
                    <p className="text-sm text-muted-foreground">Immediate notifications about emerging threats</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Weekly Security Digest</p>
                    <p className="text-sm text-muted-foreground">Curated fraud trends and prevention tips</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Expert Analysis</p>
                    <p className="text-sm text-muted-foreground">In-depth reports from security professionals</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Platform Updates</p>
                    <p className="text-sm text-muted-foreground">New features and improvements</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <CardTitle>Your Privacy</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  We take your privacy seriously. Your email will never be shared with third parties.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Unsubscribe anytime with one click</li>
                  <li>✓ Customize your email preferences</li>
                  <li>✓ No spam, ever</li>
                  <li>✓ GDPR compliant</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Subscribe to Updates</CardTitle>
              <CardDescription>Choose what you want to receive</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubscribe} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <Label>Newsletter Preferences</Label>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="scamAlerts"
                      checked={preferences.scamAlerts}
                      onCheckedChange={(checked) => 
                        setPreferences({ ...preferences, scamAlerts: checked as boolean })
                      }
                    />
                    <label htmlFor="scamAlerts" className="text-sm text-muted-foreground cursor-pointer">
                      Critical Scam Alerts (Instant notifications about urgent threats)
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="weeklyDigest"
                      checked={preferences.weeklyDigest}
                      onCheckedChange={(checked) => 
                        setPreferences({ ...preferences, weeklyDigest: checked as boolean })
                      }
                    />
                    <label htmlFor="weeklyDigest" className="text-sm text-muted-foreground cursor-pointer">
                      Weekly Security Digest (Every Monday morning)
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="productUpdates"
                      checked={preferences.productUpdates}
                      onCheckedChange={(checked) => 
                        setPreferences({ ...preferences, productUpdates: checked as boolean })
                      }
                    />
                    <label htmlFor="productUpdates" className="text-sm text-muted-foreground cursor-pointer">
                      Product Updates & New Features
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="securityTips"
                      checked={preferences.securityTips}
                      onCheckedChange={(checked) => 
                        setPreferences({ ...preferences, securityTips: checked as boolean })
                      }
                    />
                    <label htmlFor="securityTips" className="text-sm text-muted-foreground cursor-pointer">
                      Monthly Security Tips & Best Practices
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Subscribe Now
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By subscribing, you agree to receive marketing emails from Harmony Shield.
                  You can unsubscribe at any time. View our{" "}
                  <Link to="/privacy-policy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Already subscribed? Manage your preferences
            </p>
            <Button variant="outline">Update Preferences</Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default NewsletterPage;
