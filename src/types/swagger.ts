/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum DocumentType {
  Ebook = "ebook",
  Pdf = "pdf",
}

export interface DocumentMetadata {
  title?: string;
  subtitle?: string;
  authors?: string[];
  date?: string;
}

export interface DocumentDto {
  id: string;
  type: DocumentType;
  originalFileUrl: string;
  previewFileUrl: string;
  metadata: DocumentMetadata;
}

export interface UploadFileDto {
  /** @format binary */
  file: File;
}
