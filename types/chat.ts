import { Document } from 'langchain/document';

export type SourceCitation = {
  filename: string;
  page?: number;
  source: string;
};

export type Message = {
  type: 'apiMessage' | 'userMessage';
  message: string;
  isStreaming?: boolean;
  sourceDocs?: Document[];
  sources?: SourceCitation[];
};
