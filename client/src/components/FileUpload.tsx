import { useRef, useState } from 'react';
import { Button } from './ui/button';
import { useFileUpload } from '../hooks/useFileUpload';
import { Label } from './ui/label';

export function FileUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { mutate: uploadFile, isPending } = useFileUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadFile(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="file-upload" className="text-sm font-medium leading-none">
          Data File
        </Label>
        <div className="flex items-center space-x-4">
          <input
            id="file-upload"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".csv,.xlsx,.xls,.json"
            aria-label="Select data file"
            aria-describedby="file-upload-help"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            type="button"
            aria-label={selectedFile ? `Selected file: ${selectedFile.name}` : 'Select file'}
          >
            {selectedFile ? selectedFile.name : 'Select File'}
          </Button>
          {selectedFile && (
            <Button 
              onClick={handleUpload} 
              disabled={isPending}
              type="button"
              aria-label="Upload selected file"
            >
              {isPending ? 'Uploading...' : 'Upload'}
            </Button>
          )}
        </div>
        <p id="file-upload-help" className="text-sm text-muted-foreground">
          Supported formats: CSV, Excel (XLS/XLSX), JSON
        </p>
      </div>
      {isPending && (
        <p className="text-sm text-muted-foreground">
          Uploading file, please wait...
        </p>
      )}
    </div>
  );
}
