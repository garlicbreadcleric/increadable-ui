import { useRef, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import parseHtml from "html-react-parser";
import { styled } from "styled-components";
import sanitizeHtml from "sanitize-html";
import { Box, Button, Flex, Paper, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDownload } from "@tabler/icons-react";

import * as documentProvider from "../resources/document/document.provider";
import { IncreadableBookmark, IncreadableDocument } from "../db";
import { routes } from "../router";
import { BookProgress } from "../components/book-progress";
import Color from "colorjs.io";
import { BookMenu, BookMenuBookmark, BookMenuItemFlat } from "../components/book-menu";
import { BookmarkButton } from "../components/bookmark-button";

export function BookPage() {
  const navigate = useNavigate();

  const { bookId } = useParams();

  const bookRef = useRef(null);

  const [book, setBook] = useState(null as IncreadableDocument | null);
  const [preview, setPreview] = useState(null as JSX.Element | null);
  const [loading, setLoading] = useState(true);
  const [currentElementIndex, setCurrentElementIndex] = useState(0);
  const [currentElementText, setCurrentElementText] = useState("");
  const [menuItems, setMenuItems] = useState<BookMenuItemFlat[]>([]);
  const [progress, setProgress] = useState(0);
  const [progressColor, setProgressColor] = useState(new Color("#ff0000"));

  useEffect(() => {
    if (book != null) {
      document.title = book?.metadata?.title ?? book?.id;
    }

    return () => {
      document.title = "Increadable";
    };
  }, [book]);

  useEffect(() => {
    const hypothesisServer = "https://hypothes.is";

    if (preview != null) {
      const script = document.createElement("script");
      script.src = `${hypothesisServer}/embed.js`;
      document.head.appendChild(script);
    }

    return () => {
      const scripts = Array.from(document.querySelectorAll("script"));
      scripts.forEach(function (script) {
        if (script.src.startsWith(hypothesisServer)) {
          script.remove();
        }
      });

      const annotatorLink = document.querySelector('link[type="application/annotator+html"]');

      if (annotatorLink) {
        annotatorLink.dispatchEvent(new Event("destroy"));
      }
    };
  }, [preview]);

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

  useEffect(() => {
    if (bookRef.current != null) {
      const currentRef = bookRef.current as unknown as HTMLElement;
      const headings = Array.from(
        currentRef.querySelectorAll("h1,h2,h3,h4,.book--title1,.book--title2,.book--title3,.book--title4"),
      ).map((h) => {
        let level;
        if (h.tagName.toLowerCase() === "h1" || h.classList.contains("book--title1")) level = 1;
        if (h.tagName.toLowerCase() === "h2" || h.classList.contains("book--title2")) level = 2;
        if (h.tagName.toLowerCase() === "h3" || h.classList.contains("book--title3")) level = 3;
        if (h.tagName.toLowerCase() === "h4" || h.classList.contains("book--title4")) level = 4;
        const element = h as HTMLElement;
        return { level: level!, name: element.innerText, element };
      });
      setMenuItems(headings);
    }
  }, [book, bookRef]);

  useEffect(() => {
    async function handleScroll() {
      if (bookRef.current == null) {
        return;
      }
      const currentRef = bookRef.current as unknown as HTMLElement;

      const progress = Math.min(
        1.0,
        -currentRef.getBoundingClientRect().top /
          (currentRef.getBoundingClientRect().height - document.documentElement.clientHeight),
      );
      setProgress(progress * 100);

      const red = new Color("#ff0000");
      const redgreen = red.range("#00cc00", {
        space: "hsl",
        outputSpace: "srgb",
      });
      setProgressColor(redgreen(progress));

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
        setCurrentElementIndex(i);
        setCurrentElementText(elements[i].textContent ?? "");
      }
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [book, bookId]);

  return (
    <>
      <BookMenu
        items={menuItems}
        bookmarks={findBookmarkElements(book?.bookmarks ?? [])}
        removeBookmark={removeBookmark}
      />
      <BookmarkButton onClick={addBookmark} />
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
      <BookProgress color={progressColor.toString()} progress={progress} />
    </>
  );

  function isVisible(el: Element) {
    const { top, left, bottom, right } = el.getBoundingClientRect();
    const { innerHeight, innerWidth } = window;
    return (
      ((top > 0 && top < innerHeight) || (bottom > 0 && bottom < innerHeight)) &&
      ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
    );
  }

  async function addBookmark() {
    if (bookId == null || book == null) return;
    const bookmark: IncreadableBookmark = {
      id: crypto.randomUUID(),
      elementIndex: currentElementIndex,
      content: currentElementText,
      createdAt: new Date(),
    };
    const newBook = {
      ...book,
      bookmarks: [...book.bookmarks, bookmark],
    };
    setBook(newBook);
    await documentProvider.update(bookId, newBook);

    notifications.show({
      title: "Bookmark added!",
      message: <Text lineClamp={4}>{currentElementText}</Text>,
    });
  }

  async function removeBookmark(bookmarkId: string) {
    if (bookId == null || book == null) return;
    const newBook = { ...book, bookmarks: book.bookmarks.filter((bookmark) => bookmark.id !== bookmarkId) };
    setBook(newBook);
    await documentProvider.update(bookId, newBook);
  }

  function findBookmarkElements(bookmarks: IncreadableBookmark[]): BookMenuBookmark[] {
    if (bookRef.current == null) {
      return [];
    }
    const currentRef = bookRef.current as unknown as HTMLElement;
    const elements = Array.from(currentRef.children) as HTMLElement[];

    return bookmarks.map((bookmark) => ({ ...bookmark, element: elements[bookmark.elementIndex] }));
  }
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
