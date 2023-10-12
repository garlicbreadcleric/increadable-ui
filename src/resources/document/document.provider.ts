import { IncreadableDocument, db } from "../../db";
import * as documentApi from "./document.api";

export async function findById(documentId: string): Promise<IncreadableDocument | null> {
  {
    const document = await db.documents.where("id").equals(documentId).first();
    if (document != null) {
      if (document.bookmarks == null) document.bookmarks = [];
      if (document.metadata == null) document.metadata = {};

      return document;
    }
  }
  const remoteDocument = await documentApi.findById(documentId);
  if (remoteDocument == null) {
    return null;
  }
  const previewFileHtml = await fetch(remoteDocument.previewFileUrl).then((r) => r.text());
  const document: IncreadableDocument = {
    id: documentId,
    type: remoteDocument.type,
    originalFileUrl: remoteDocument.originalFileUrl,
    previewFileUrl: remoteDocument.previewFileUrl,
    previewFileHtml,
    metadata: remoteDocument.metadata,
    bookmarks: [],
  };
  await db.documents.add(document);
  return document;
}

export async function findAll(): Promise<IncreadableDocument[]> {
  return await db.documents.toArray();
}

export async function update(documentId: string, document: IncreadableDocument): Promise<void> {
  await db.documents.update(documentId, document);
}

export async function remove(documentId: string): Promise<void> {
  await db.documents.delete(documentId);
}
