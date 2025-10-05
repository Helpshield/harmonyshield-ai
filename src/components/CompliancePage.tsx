import { Shield, CheckCircle, FileText, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "./PublicLayout";

const CompliancePage = () => {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="mb-4">← Back to Home</Button>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Compliance & Certifications</h1>
            </div>
            <p className="text-muted-foreground">
              Harmony Shield meets the highest industry standards for security, privacy, and compliance
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>SOC 2 Type II</CardTitle>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500">Certified</Badge>
                </div>
                <CardDescription>Service Organization Control</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Our SOC 2 Type II certification demonstrates our commitment to maintaining the highest
                  standards of security, availability, processing integrity, confidentiality, and privacy.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Annual third-party audits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Continuous monitoring and improvement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Certified since 2023</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>GDPR Compliant</CardTitle>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500">Compliant</Badge>
                </div>
                <CardDescription>General Data Protection Regulation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Full compliance with EU GDPR requirements, ensuring the protection and privacy of
                  personal data for all EU citizens.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Right to access, rectification, and erasure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Data portability and processing transparency</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Appointed Data Protection Officer</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>ISO 27001</CardTitle>
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-500">Certified</Badge>
                </div>
                <CardDescription>Information Security Management</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  ISO 27001 certification validates our comprehensive information security management
                  system and risk management processes.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Systematic approach to security</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Regular security audits and reviews</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Risk assessment and mitigation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>CCPA Compliant</CardTitle>
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-500">Compliant</Badge>
                </div>
                <CardDescription>California Consumer Privacy Act</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Full compliance with California's privacy law, providing enhanced privacy rights
                  and consumer protection.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Right to know and delete personal data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Opt-out of data selling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Non-discrimination for privacy rights</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-primary" />
                <CardTitle>Additional Security Measures</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Penetration Testing</h3>
                  <p className="text-sm text-muted-foreground">
                    Quarterly third-party penetration testing to identify and address vulnerabilities
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Bug Bounty Program</h3>
                  <p className="text-sm text-muted-foreground">
                    Active security researcher community helping identify potential issues
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">24/7 Security Monitoring</h3>
                  <p className="text-sm text-muted-foreground">
                    Continuous monitoring with automated threat detection and response
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle>Audit Reports</CardTitle>
              </div>
              <CardDescription>Request access to our compliance documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We provide detailed audit reports and compliance documentation to enterprise customers
                under NDA. Contact our compliance team for access.
              </p>
              <Button>Request Audit Reports</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default CompliancePage;
