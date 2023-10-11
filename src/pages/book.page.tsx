import { useRef, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import parseHtml from "html-react-parser";
import { styled } from "styled-components";
import sanitizeHtml from "sanitize-html";
import { Box, Button, Flex, Paper, Text, Title } from "@mantine/core";

import * as documentProvider from "../resources/document/document.provider";
import { Document } from "../db";
import { routes } from "../router";
import { IconDownload } from "@tabler/icons-react";

export function BookPage() {
  const { bookId } = useParams();

  const bookRef = useRef(null);

  const [book, setBook] = useState(null as Document | null);
  const [preview, setPreview] = useState(null as JSX.Element | null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBook() {
      if (bookId != null) {
        const book = await documentProvider.findById(bookId);
        setBook(book);
        setLoading(false);

        if (book?.previewFileHtml != null) {
          const previewHtml = sanitizeHtml(book.previewFileHtml, {
            allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
            allowedSchemes: [...sanitizeHtml.defaults.allowedSchemes, "data"],
            allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, "*": ["id"] },
            allowedClasses: { "*": ["*"] },
            transformTags: {
              "*": (tagName, attribs) => {
                const newAttribs = { ...attribs };
                if (newAttribs.class != null) {
                  const classList = newAttribs.class.split(" ").map((c) => `book--${c}`);
                  newAttribs.class = classList.join(" ");
                }
                return { tagName, attribs: newAttribs };
              },
            },
          });
          setPreview(parseHtml(previewHtml) as JSX.Element);
        }
      }
    }

    fetchBook();
  }, [bookId]);

  const navigate = useNavigate();

  useEffect(() => {
    if (book?.currentElementIndex != null) {
      if (bookRef.current != null) {
        const currentRef = bookRef.current as unknown as HTMLElement;
        const element = currentRef.children[book.currentElementIndex];
        element.classList.add("current-element");
        element.scrollIntoView();
        console.log(`book.currentElementIndex: ${book.currentElementIndex}`);
      }
    }
  }, [book, bookRef]);

  const isVisible = (el: Element) => {
    const { top, left, bottom, right } = el.getBoundingClientRect();
    const { innerHeight, innerWidth } = window;
    return (
      ((top > 0 && top < innerHeight) || (bottom > 0 && bottom < innerHeight)) &&
      ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
    );
  };

  useEffect(() => {
    async function handleScroll() {
      if (bookRef.current == null) {
        return;
      }
      const currentRef = bookRef.current as unknown as HTMLElement;

      let visibleElement = null;
      const elements = Array.from(currentRef.children);
      let i;
      for (i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;
        if (isVisible(element)) {
          visibleElement = element;
          break;
        }
      }
      if (bookId != null && book != null && visibleElement != null) {
        const newBook = { ...book, currentElementIndex: i };
        console.log(`i: ${i}`);
        // setBook(newBook);
        await documentProvider.update(bookId, newBook);
      }
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [book, bookId]);

  return (
    <Flex w="100%" justify="center" p="xl">
      <Paper w="100%" maw={800}>
        <Title order={1} mb="md" style={{ cursor: "pointer" }} onClick={() => navigate(routes.index)}>
          Inc<u>read</u>able
        </Title>
        {!loading && preview != null ? (
          <>
            <Button component="a" href={book!.originalFileUrl} rightSection={<IconDownload size={16} />}>
              Download original file
            </Button>
            <Book ref={bookRef}>{preview}</Book>
          </>
        ) : (
          <Text>Loading...</Text>
        )}
      </Paper>
    </Flex>
  );
}

const Book = styled(Box)`
  word-wrap: break-word;

  * {
    max-width: 100%;
  }

  h1,
  .book--title,
  .book--title1 {
    font-size: 2em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
  }

  h2,
  .book--title2 {
    font-size: 1.5em;
    margin-block-start: 0.83em;
    margin-block-end: 0.83em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
  }

  p,
  .book--paragraph {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
`;
