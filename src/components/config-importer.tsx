"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Spinner } from "./ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { CheckCircle, AlertCircle, ExternalLink, X } from "lucide-react";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/hooks/domains/domain.hooks";
import apiClient from "@/lib/api-client";

type CaddyRoute = {
  match: Array<{ host: string[] }>;
  handle: any[];
};

type ParsedDomain = {
  incomingAddress: string;
  destinationAddress: string;
  port: number;
  enableHttps: boolean;
  redirectUrl?: string;
  isValid: boolean;
  errorMessage?: string;
};

export default function ConfigImporter() {
  const [configText, setConfigText] = useState<string>("");
  const [parsedDomains, setParsedDomains] = useState<ParsedDomain[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState<boolean>(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number }>({
    success: 0,
    failed: 0,
  });
  const [showResultsDialog, setShowResultsDialog] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const canManageDomains = user?.isAdmin;

  const parseConfig = () => {
    setIsParsing(true);
    try {
      const configData = JSON.parse(configText);
      const extractedDomains: ParsedDomain[] = [];

      if (configData?.apps?.http?.servers?.main?.routes) {
        const routes = configData.apps.http.servers.main.routes as CaddyRoute[];

        routes.forEach(route => {
          if (route.match && Array.isArray(route.match) && route.match.length > 0) {
            const matchBlock = route.match[0];

            if (matchBlock.host && Array.isArray(matchBlock.host)) {
              matchBlock.host.forEach(host => {
                try {
                  const isRedirect = route.handle?.some(
                    h => h.handler === "subroute" &&
                      h.routes?.[0]?.handle?.[0]?.handler === "static_response" &&
                      h.routes?.[0]?.handle?.[0]?.headers?.Location
                  );

                  let destinationAddress = "";
                  let port = 80;
                  let enableHttps = true;
                  let redirectUrl = undefined;

                  if (isRedirect) {
                    const redirectHandler = route.handle.find(h =>
                      h.handler === "subroute" &&
                      h.routes?.[0]?.handle?.[0]?.handler === "static_response"
                    );

                    const locationHeader = redirectHandler?.routes?.[0]?.handle?.[0]?.headers?.Location?.[0];
                    if (locationHeader) {
                      const match = locationHeader.match(/https?:\/\/([^{]+)/);
                      if (match && match[1]) {
                        redirectUrl = match[1];
                        enableHttps = locationHeader.startsWith("https");

                        extractedDomains.push({
                          incomingAddress: host,
                          destinationAddress: "",
                          port: 0,
                          enableHttps,
                          redirectUrl,
                          isValid: true
                        });
                      }
                    }
                  } else {
                    const reverseProxyHandler = route.handle.find(h =>
                      h.handler === "reverse_proxy" ||
                      (h.handler === "subroute" && h.routes?.[0]?.handle?.[0]?.handler === "reverse_proxy")
                    );

                    if (reverseProxyHandler) {
                      let upstreams;

                      if (reverseProxyHandler.handler === "reverse_proxy") {
                        upstreams = reverseProxyHandler.upstreams;
                      } else if (reverseProxyHandler.routes?.[0]?.handle?.[0]?.upstreams) {
                        upstreams = reverseProxyHandler.routes[0].handle[0].upstreams;
                      }

                      if (upstreams && upstreams.length > 0) {
                        const upstream = upstreams[0];
                        if (upstream.dial) {
                          const [address, portStr] = upstream.dial.split(':');
                          destinationAddress = address;
                          port = parseInt(portStr, 10);

                          if (reverseProxyHandler.transport?.protocol === "http") {
                            enableHttps = !(reverseProxyHandler.transport?.tls === undefined);
                          }

                          extractedDomains.push({
                            incomingAddress: host,
                            destinationAddress: destinationAddress ?? "",
                            port,
                            enableHttps,
                            isValid: true
                          });
                        }
                      }
                    }
                  }
                } catch (error) {
                  extractedDomains.push({
                    incomingAddress: host,
                    destinationAddress: "",
                    port: 0,
                    enableHttps: true,
                    isValid: false,
                    errorMessage: "Failed to parse route configuration"
                  });
                }
              });
            }
          }
        });
      } else {
        toast.error("Invalid Caddy configuration format");
      }

      setParsedDomains(extractedDomains);
      if (extractedDomains.length > 0) {
        setShowPreviewDialog(true);
      } else {
        toast.warning("No domains found in configuration");
      }
    } catch (error) {
      toast.error("Invalid JSON format");
      console.error("Error parsing config:", error);
    } finally {
      setIsParsing(false);
    }
  };

  const importDomains = async () => {
    if (!parsedDomains.length) return;

    setIsImporting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      await apiClient.post('/api/config/import', {
        config: JSON.parse(configText)
      });

      for (const domain of parsedDomains) {
        if (!domain.isValid) {
          failCount += 1;
          continue;
        }

        try {
          if (domain.redirectUrl) {
            await apiClient.post('/api/domain/add', {
              domain: domain.incomingAddress,
              enableRedirection: true,
              redirectTo: domain.redirectUrl,
              enableHttps: domain.enableHttps,
              destinationAddress: "",
            });
          } else {
            await apiClient.post('/api/domain/add', {
              domain: domain.incomingAddress,
              enableRedirection: false,
              destinationAddress: domain.destinationAddress,
              port: domain.port.toString(),
              enableHttps: domain.enableHttps
            });
          }
          successCount += 1;
        } catch (error) {
          console.error("Error importing domain:", domain.incomingAddress, error);
          failCount += 1;
        }
      }

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DOMAINS] });

      setImportResults({
        success: successCount,
        failed: failCount
      });
      setShowResultsDialog(true);

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} domains`);
      }
      if (failCount > 0) {
        toast.error(`Failed to import ${failCount} domains`);
      }
    } catch (error) {
      toast.error("Failed to import configuration");
      console.error("Import error:", error);
    } finally {
      setIsImporting(false);
      setShowPreviewDialog(false);
      setConfigText("");
    }
  };

  if (!canManageDomains) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to import Caddy configurations.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Import Caddy Configuration</CardTitle>
          <CardDescription>
            Paste your Caddy JSON configuration to import domains into Caddy Control
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder='Paste your Caddy JSON configuration here...'
            className="min-h-[300px] font-mono text-sm"
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button
            onClick={parseConfig}
            disabled={!configText.trim() || isParsing}
          >
            {isParsing ? <Spinner className="mr-2 h-4 w-4" /> : null}
            Parse Configuration
          </Button>
        </CardFooter>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Domain Preview</DialogTitle>
            <DialogDescription>
              The following domains were found in the configuration. Please review before importing.
            </DialogDescription>
          </DialogHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>HTTPS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsedDomains.map((domain, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {domain.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell>{domain.incomingAddress}</TableCell>
                  <TableCell>
                    {domain.redirectUrl ? (
                      <div className="flex items-center gap-1">
                        <Badge variant="outline">Redirect</Badge>
                        <span>{domain.redirectUrl}</span>
                      </div>
                    ) : (
                      <span>{domain.destinationAddress}:{domain.port}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {domain.enableHttps ? (
                      <Badge variant="default" className="bg-green-500">Enabled</Badge>
                    ) : (
                      <Badge variant="outline">Disabled</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={importDomains}
              disabled={isImporting || parsedDomains.length === 0}
            >
              {isImporting ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Import {parsedDomains.length} Domains
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Results</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col space-y-4 py-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Successfully imported: {importResults.success} domains</span>
            </div>

            {importResults.failed > 0 && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span>Failed to import: {importResults.failed} domains</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowResultsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}