import { Document, db } from "../../db";
import * as documentApi from "./document.api";

export async function findById(documentId: string): Promise<Document | null> {
  {
    const document = await db.documents.where("id").equals(documentId).first();
    if (document != null) {
      return document;
    }
  }
  const remoteDocument = await documentApi.findById(documentId);
  if (remoteDocument == null) {
    return null;
  }
  const previewFileHtml = await fetch(remoteDocument.previewFileUrl).then((r) => r.text());
  const document: Document = {
    id: documentId,
    type: remoteDocument.type,
    originalFileUrl: remoteDocument.originalFileUrl,
    previewFileUrl: remoteDocument.previewFileUrl,
    previewFileHtml,
    metadata: remoteDocument.metadata,
  };
  await db.documents.add(document);
  return document;
}

export async function findAll(): Promise<Document[]> {
  return await db.documents.toArray();
}

export async function update(documentId: string, document: Document): Promise<void> {
  await db.documents.update(documentId, document);
}

export async function remove(documentId: string): Promise<void> {
  await db.documents.delete(documentId);
}
