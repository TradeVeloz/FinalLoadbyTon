import { DocumentRecord, DocumentType } from '../types';

const documents: DocumentRecord[] = [
  {
    id: 'doc-1',
    jobId: 'job-101',
    uploaderId: 'usr-shipper-1',
    type: 'CUSTOMS_CLEARANCE',
    title: 'Customs Declaration Bill (Mirsal II)',
    fileUrl: 'https://loadbyton.ae/docs/customs_mirsal_9281.pdf',
    fileSize: '1.4 MB',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'doc-2',
    jobId: 'job-101',
    uploaderId: 'usr-shipper-1',
    type: 'COLLECTION_RECEIPT',
    title: 'DP World Gate Pass & EIR Receipt',
    fileUrl: 'https://loadbyton.ae/docs/eir_gatepass_9281.pdf',
    fileSize: '820 KB',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'doc-3',
    jobId: 'job-102',
    uploaderId: 'usr-shipper-1',
    type: 'CUSTOMS_CLEARANCE',
    title: 'Reefer Set-Point Instruction Sheet',
    fileUrl: 'https://loadbyton.ae/docs/reefer_setpoint.pdf',
    fileSize: '210 KB',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

export function listDocumentsForJob(jobId: string): DocumentRecord[] {
  return documents.filter((d) => d.jobId === jobId);
}

export function getDocument(id: string): DocumentRecord | undefined {
  return documents.find((d) => d.id === id);
}

export function createDocument(
  jobId: string,
  data: { type: DocumentType; title: string; fileUrl: string; fileSize?: string },
  uploaderId: string
): DocumentRecord {
  const doc: DocumentRecord = {
    id: `doc-${Date.now()}`,
    jobId,
    uploaderId,
    type: data.type,
    title: data.title,
    fileUrl: data.fileUrl,
    fileSize: data.fileSize,
    createdAt: new Date().toISOString(),
  };
  documents.push(doc);
  return doc;
}

export function deleteDocument(id: string): boolean {
  const idx = documents.findIndex((d) => d.id === id);
  if (idx === -1) return false;
  documents.splice(idx, 1);
  return true;
}
