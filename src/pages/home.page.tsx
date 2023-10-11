import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Anchor, Box, CloseButton, Flex, Group, Paper, Text, Title, rem } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { IconBook2, IconUpload, IconX } from "@tabler/icons-react";

import * as documentApi from "../resources/document/document.api";
import * as documentProvider from "../resources/document/document.provider";
import { routes } from "../router";
import { Document } from "../db";

export function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>();

  async function fetchDocuments() {
    setDocuments(await documentProvider.findAll());
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function handleFiles(files: FileWithPath[]) {
    setLoading(true);
    try {
      const document = await documentApi.upload(files[0]);
      navigate(`${routes.book}/${document.id}`);
    } catch (e) {
      setLoading(false);
    }
  }

  function showDocumentAnchor(d: Document) {
    if (d.metadata?.title != null) {
      if (d.metadata.authors != null) {
        return (
          <Text>
            <Anchor fw="bold" href={`/book/${d.id}`}>
              {d.metadata.title}
            </Anchor>{" "}
            by{" "}
            <Text component="span" fw="bold">
              {d.metadata.authors}
            </Text>
          </Text>
        );
      }
      return (
        <Anchor fw="bold" href={`/book/${d.id}`}>
          {d.metadata.title}
        </Anchor>
      );
    }
    return (
      <Text>
        <Anchor href={`/book/${d.id}`}>{d.id}</Anchor>
      </Text>
    );
  }

  return (
    <Flex w="100%" justify="center" p="xl">
      <Paper w="100%" maw={800}>
        <Title order={1} mb="md" style={{ cursor: "pointer" }} onClick={() => navigate(routes.index)}>
          Inc<u>read</u>able
        </Title>

        <Dropzone loading={loading} onDrop={handleFiles} onReject={(files) => console.error(files[0])} w="100%">
          <Group justify="center" gap="lg" p="xl">
            <Dropzone.Accept>
              <IconUpload
                style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-blue-6)" }}
                stroke={1.5}
              />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-red-6)" }} stroke={1.5} />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconBook2
                style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-dimmed)" }}
                stroke={1.5}
              />
            </Dropzone.Idle>

            <div>
              <Text size="xl" inline>
                Drag and drop a document to read and annotate
              </Text>
              <Text size="sm" inline c="dimmed">
                Supported formats: EPUB, FB2, Markdown
              </Text>
            </div>
          </Group>
        </Dropzone>

        <Box>
          {documents?.map((d) => (
            <Paper key={d.id} shadow="xs" mt="sm" p="md">
              <Flex justify="space-between">
                {showDocumentAnchor(d)}
                <CloseButton
                  onClick={async () => {
                    await documentProvider.remove(d.id);
                    await fetchDocuments();
                  }}
                />
              </Flex>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Flex>
  );
}
