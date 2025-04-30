import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

import { parseCaddyConfig } from '@/lib/utils/config-parser';
import { ParsedDomain, ImportResult, useImportDomains } from '@/hooks/domains/domain.hooks';

interface DomainImportDialogsProps {
  showImportDialog: boolean;
  setShowImportDialog: (value: boolean) => void;
}

export const DomainImportDialogs: React.FC<DomainImportDialogsProps> = ({
  showImportDialog,
  setShowImportDialog
}) => {
  const [configText, setConfigText] = useState<string>("");
  const [parsedDomains, setParsedDomains] = useState<ParsedDomain[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState<boolean>(false);
  const [importResults, setImportResults] = useState<ImportResult>({
    success: 0,
    failed: 0,
  });
  const [showResultsDialog, setShowResultsDialog] = useState<boolean>(false);
  
  const importDomainsMutation = useImportDomains();

  const handleParseConfig = () => {
    setIsParsing(true);
    try {
      const result = parseCaddyConfig(configText);
      
      if (result.success) {
        setParsedDomains(result.parsedDomains);
        if (result.parsedDomains.length > 0) {
          setShowImportDialog(false);
          setShowPreviewDialog(true);
        } else {
          toast.warning("No domains found in configuration");
        }
      } else {
        toast.error(result.error || "Failed to parse configuration");
      }
    } catch (error) {
      toast.error("Error parsing configuration");
      console.error(error);
    } finally {
      setIsParsing(false);
    }
  };

  const handleImportDomains = async () => {
    if (!parsedDomains.length) return;
    
    try {
      const result = await importDomainsMutation.mutateAsync({
        parsedDomains,
        configText
      });
      
      setImportResults(result);
      setShowPreviewDialog(false);
      setShowResultsDialog(true);
    } catch (error) {
      toast.error("Failed to import configuration");
      console.error("Import error:", error);
    } finally {
      setConfigText("");
    }
  };
  
  const closeAllDialogs = () => {
    setShowImportDialog(false);
    setShowPreviewDialog(false);
    setShowResultsDialog(false);
    setParsedDomains([]);
    setConfigText("");
  };

  return (
    <>
      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle>Import Caddy Configuration</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Paste your Caddy JSON configuration here..."
              className="min-h-[300px] font-mono text-sm"
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleParseConfig} 
              disabled={!configText.trim() || isParsing}
            >
              {isParsing ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Parse Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Domain Preview</DialogTitle>
          </DialogHeader>
          
          <div className="py-2 text-muted-foreground text-sm">
            The following domains were found in the configuration. Please review before importing.
          </div>
          
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
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImportDomains} 
              disabled={importDomainsMutation.isPending || parsedDomains.length === 0}
            >
              {importDomainsMutation.isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Import {parsedDomains.length} Domains
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Results Dialog */}
      <Dialog open={showResultsDialog} onOpenChange={() => closeAllDialogs()}>
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
                <X className="h-5 w-5 text-red-500" />
                <span>Failed to import: {importResults.failed} domains</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => closeAllDialogs()}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};