import ky from "ky";
import { FileWithPath } from "@mantine/dropzone";

import { DocumentDto } from "./document.type";

export async function findById(documentId: string): Promise<DocumentDto | null> {
  return await ky.get(`${import.meta.env.VITE_API_URL}/v1/documents/${documentId}`).json();
}

export async function upload(file: FileWithPath): Promise<DocumentDto> {
  const formData = new FormData();
  formData.append("file", file);

  return await ky.post(`${import.meta.env.VITE_API_URL}/v1/documents`, { body: formData }).json();
}
