import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { Anchor, Box, Burger, CloseButton, Drawer, NavLink, SegmentedControl, Tabs, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { IncreadableBookmark } from "../db";

type BookMenuTab = "contents" | "bookmarks";
type BookmarkSorting = "location" | "oldest" | "newest";

export type BookMenuItemFlat = { name: string; element: HTMLElement; level: number; active: boolean };
export type BookMenuItem = BookMenuItemFlat & { children: BookMenuItem[] };

export type BookMenuBookmark = IncreadableBookmark & { element: HTMLElement };

export type BookMenuProps = {
  items: BookMenuItemFlat[];
  bookmarks: BookMenuBookmark[];
  removeBookmark: (bookmarkId: string) => void;
};
export type BookMenuItemsProps = { items: BookMenuItem[] };

export function BookMenu({ items, bookmarks, removeBookmark }: BookMenuProps) {
  const nestedItems = unflattenBookMenuItems(items);
  const [opened, { open, close, toggle }] = useDisclosure();

  const [tab, setTab] = useState<BookMenuTab>("contents");
  const [bookmarkSorting, setBookmarkSorting] = useState<BookmarkSorting>("location");

  function saveTab(t: BookMenuTab) {
    localStorage.setItem("bookMenuTab", t);
    setTab(t);
  }

  function saveBookmarkSorting(s: BookmarkSorting) {
    localStorage.setItem("bookmarkSorting", s);
    setBookmarkSorting(s);
  }

  useEffect(() => {
    const t = localStorage.getItem("bookMenuTab");
    const s = localStorage.getItem("bookmarkSorting");
    if (t != null) setTab(t as BookMenuTab);
    if (s != null) setBookmarkSorting(s as BookmarkSorting);
  }, []);

  useEffect(() => {
    const sidebar = document.querySelector("hypothesis-sidebar") as HTMLElement | undefined;
    if (sidebar == null) return;
    if (opened) sidebar.style.display = "none";
    else sidebar.style.display = "inline";
  }, [opened]);

  return (
    <>
      <Burger opened={opened} onClick={toggle} m="sm" style={{ position: "fixed", zIndex: 10000 }} />

      <Drawer.Root opened={opened} onClose={close}>
        <Drawer.Overlay />
        <Drawer.Content>
          <Box h="100%" style={{ overflowY: "scroll" }}>
            <Tabs defaultValue="contents" value={tab} onChange={(t) => saveTab(t as BookMenuTab)}>
              <Drawer.Header p={0} w="100%">
                <Tabs.List w="100%">
                  {/* I'm truly sorry for this. */}
                  <Burger opened={opened} onClick={toggle} m="sm" color="rgba(0,0,0,0)" />
                  <Tabs.Tab value="contents">
                    <Text size="md" inline>
                      Contents
                    </Text>
                  </Tabs.Tab>
                  <Tabs.Tab value="bookmarks">
                    <Text size="md" inline>
                      Bookmarks
                    </Text>
                  </Tabs.Tab>
                </Tabs.List>
              </Drawer.Header>

              <Tabs.Panel value="contents">
                <BookMenuItems items={nestedItems} />
              </Tabs.Panel>

              <Tabs.Panel value="bookmarks">
                <SegmentedControl
                  fullWidth
                  radius={0}
                  value={bookmarkSorting}
                  onChange={(s) => saveBookmarkSorting(s as BookmarkSorting)}
                  data={[
                    { label: "Location", value: "location" },
                    { label: "Newest", value: "newest" },
                    { label: "Oldest", value: "oldest" },
                  ]}
                />
                {bookmarks.sort(bookmarkComparator).map((bookmark) => (
                  <NavLink
                    component="div"
                    key={bookmark.id}
                    bg="none"
                    label={
                      <Anchor size="sm" c="dark" onClick={() => bookmark.element.scrollIntoView()} lineClamp={4}>
                        {bookmark.content}
                      </Anchor>
                    }
                    description={`${DateTime.fromJSDate(bookmark.createdAt).toLocaleString(DateTime.DATETIME_FULL)}`}
                    rightSection={<CloseButton onClick={() => removeBookmark(bookmark.id)} />}
                  />
                ))}
              </Tabs.Panel>
            </Tabs>
          </Box>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );

  function unflattenBookMenuItems(flatList: BookMenuItemFlat[]): BookMenuItem[] {
    const result = [];

    for (let i = 0; i < flatList.length; i++) {
      const flatItem = flatList[i];
      if (result.length === 0 || flatItem.level === 1) {
        const nestedItem: BookMenuItem = { ...flatItem, children: [] };
        result.push(nestedItem);
      } else {
        let parent = result.at(-1);
        while (parent!.children.length > 0 && parent!.children.at(-1)!.level < flatItem.level) {
          parent = parent!.children.at(-1)!;
        }
        parent!.children.push({ ...flatItem, children: [] });
      }
    }

    activateBookMenuItems(result);

    return result;
  }

  function activateBookMenuItems(nestedList: BookMenuItem[]) {
    for (const item of nestedList) {
      activateBookMenuItems(item.children);
      if (item.children.some((c) => c.active)) {
        item.active = true;
      }
    }
  }

  function bookmarkComparator(a: BookMenuBookmark, b: BookMenuBookmark): number {
    switch (bookmarkSorting) {
      case "location":
        return a.elementIndex - b.elementIndex;
      case "newest":
        return a.createdAt < b.createdAt ? 1 : a.createdAt === b.createdAt ? 0 : -1;
      case "oldest":
        return a.createdAt < b.createdAt ? -1 : a.createdAt === b.createdAt ? 0 : 1;
    }
  }
}

export function BookMenuItems({ items }: BookMenuItemsProps) {
  return (
    <>
      {items.map((item, i) => (
        <NavLink
          active={item.active}
          color="dark"
          variant="light"
          component="div"
          key={i}
          label={
            <Anchor
              c="dark"
              onClick={(e) => {
                e.stopPropagation();
                item.element.scrollIntoView();
              }}
            >
              {item.name}
            </Anchor>
          }
        >
          {item.children.length > 0 ? <BookMenuItems items={item.children} /> : null}
        </NavLink>
      ))}
    </>
  );
}
