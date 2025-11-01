import { useMutation } from '@tanstack/react-query';
import { apiService } from '../services/api';

export function useFileUpload() {
  return useMutation({
    mutationFn: (file: File) => apiService.uploadFile(file),
    onSuccess: (data) => {
      console.log('File uploaded successfully:', data);
    },
    onError: (error: Error) => {
      console.error('Error uploading file:', error);
    },
  });
}
