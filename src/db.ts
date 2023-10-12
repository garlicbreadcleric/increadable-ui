import Dexie, { Table } from "dexie";

import { DocumentMetadata, DocumentType } from "./resources/document/document.type";

export type IncreadableBookmark = {
  id: string;
  elementIndex: number;
  content: string;
  createdAt: Date;
};

export type IncreadableDocument = {
  id: string;
  type: DocumentType;
  originalFileUrl: string;
  previewFileUrl: string;
  previewFileHtml?: string;
  metadata: DocumentMetadata;
  bookmarks: IncreadableBookmark[];
};

export class IncreadableDatabase extends Dexie {
  documents!: Table<IncreadableDocument, string>;

  constructor() {
    super("increadable");
    this.version(1).stores({
      documents: "&id, type",
    });
  }
}

export const db = new IncreadableDatabase();
