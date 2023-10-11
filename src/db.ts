import Dexie, { Table } from "dexie";

import { DocumentMetadata, DocumentType } from "./resources/document/document.type";

export type Document = {
  id: string;
  type: DocumentType;
  previewFileUrl: string;
  previewFileHtml?: string;
  metadata?: DocumentMetadata;
  currentElementIndex?: number;
};

export class IncreadableDatabase extends Dexie {
  documents!: Table<Document, string>;

  constructor() {
    super("increadable");
    this.version(1).stores({
      documents: "&id, type",
    });
  }
}

export const db = new IncreadableDatabase();
