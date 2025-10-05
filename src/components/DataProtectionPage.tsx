import { PublicLayout } from './PublicLayout';
import { Shield, Lock, Database, Eye, FileText, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const DataProtectionPage = () => {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="mb-4">← Back to Home</Button>
            </Link>
            <h1 className="text-4xl font-bold text-foreground mb-4">Data Protection Policy</h1>
            <p className="text-muted-foreground">Last Updated: January 2024</p>
          </div>

          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Our Commitment to Data Protection</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                At Harmony Shield, protecting your data is our highest priority. We implement comprehensive security measures
                and follow industry best practices to ensure your personal information remains safe and secure.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Data Encryption</h2>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• End-to-end encryption for all sensitive data</li>
                <li>• TLS 1.3 for data in transit</li>
                <li>• AES-256 encryption for data at rest</li>
                <li>• Regular security audits and penetration testing</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Data Storage & Retention</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Your data is stored in secure, geographically distributed data centers with multiple redundancy layers.
                We retain data only as long as necessary for service provision and legal compliance.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Active account data: Retained while account is active</li>
                <li>• Deleted account data: Permanently removed within 30 days</li>
                <li>• Transaction records: Retained for 7 years (legal requirement)</li>
                <li>• Security logs: Retained for 1 year for audit purposes</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Access Controls</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We implement strict access controls to ensure only authorized personnel can access user data,
                and only when necessary for service operations or security purposes.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <UserCheck className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Your Rights</h2>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Right to access your personal data</li>
                <li>• Right to rectification of inaccurate data</li>
                <li>• Right to erasure ("right to be forgotten")</li>
                <li>• Right to data portability</li>
                <li>• Right to object to processing</li>
                <li>• Right to withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Data Breach Protocol</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                In the unlikely event of a data breach, we will notify affected users within 72 hours and provide
                detailed information about the breach, affected data, and remediation steps.
              </p>
            </section>

            <section className="border-t border-border pt-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Our Data Protection Officer</h2>
              <p className="text-muted-foreground mb-4">
                For any questions or concerns about data protection:
              </p>
              <p className="text-muted-foreground">
                Email: <a href="mailto:dpo@harmonyshield.com" className="text-primary hover:underline">dpo@harmonyshield.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default DataProtectionPage;
