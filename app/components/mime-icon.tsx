import {
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  FileX,
  Archive,
  Code,
  Database,
  BookOpen,
  Presentation,
  Zap,
} from "lucide-react";

export function MimeIcon({ 
  mimeType, 
  className = "h-4 w-4" 
}: { 
  mimeType: string;
  className?: string;
}) {
  const getIcon = () => {
    // Handle specific MIME types first
    switch (mimeType) {
      // Microsoft Office
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return <FileSpreadsheet className={className} />;
      
      case 'application/vnd.ms-powerpoint':
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return <Presentation className={className} />;
      
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return <FileText className={className} />;
      
      // Archives
      case 'application/zip':
      case 'application/x-rar-compressed':
      case 'application/x-7z-compressed':
      case 'application/x-tar':
      case 'application/gzip':
        return <Archive className={className} />;
      
      // Databases
      case 'application/x-sqlite3':
      case 'application/vnd.ms-access':
        return <Database className={className} />;
      
      // PDFs and documents
      case 'application/pdf':
        return <BookOpen className={className} />;
      
      // Executables
      case 'application/x-executable':
      case 'application/x-msdownload':
        return <Zap className={className} />;
      
      default:
        // Handle by category (first part of MIME type)
        const [category] = mimeType.split('/');
        
        switch (category) {
          case 'text':
            // Check for code files
            if (mimeType.includes('javascript') || 
                mimeType.includes('json') ||
                mimeType.includes('xml') ||
                mimeType.includes('html') ||
                mimeType.includes('css')) {
              return <Code className={className} />;
            }
            return <FileText className={className} />;
          
          case 'image':
            return <FileImage className={className} />;
          
          case 'video':
            return <FileVideo className={className} />;
          
          case 'audio':
            return <FileAudio className={className} />;
          
          case 'application':
            // Handle common application types
            if (mimeType.includes('json') || 
                mimeType.includes('javascript') ||
                mimeType.includes('xml')) {
              return <Code className={className} />;
            }
            return <File className={className} />;
          
          default:
            return <File className={className} />;
        }
    }
  };

  return getIcon();
}
