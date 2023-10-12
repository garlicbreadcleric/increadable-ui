import { Anchor, Burger, CloseButton, Drawer, Flex, NavLink, SegmentedControl, Tabs, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IncreadableBookmark } from "../db";
import { useState } from "react";

type BookMenuTab = "contents" | "bookmarks";
type BookmarkSorting = "location" | "oldest" | "newest";

export type BookMenuItemFlat = { name: string; element: HTMLElement; level: number };
export type BookMenuItem = { name: string; element: HTMLElement; children: BookMenuItem[]; level: number };

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

  return (
    <>
      <Burger opened={opened} onClick={toggle} m="sm" style={{ position: "fixed", zIndex: 10000 }} />

      <Drawer.Root opened={opened} onClose={close}>
        <Drawer.Overlay />
        <Drawer.Content style={{ overflowY: "scroll" }}>
          <Flex h="100%" justify="space-between" direction="column">
            <Tabs defaultValue="contents" value={tab} onChange={(t) => setTab(t as BookMenuTab)}>
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
                  w="100%"
                  value={bookmarkSorting}
                  onChange={(s) => setBookmarkSorting(s as BookmarkSorting)}
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
                    description={`${bookmark.createdAt}`}
                    rightSection={<CloseButton onClick={() => removeBookmark(bookmark.id)} />}
                  />
                ))}
              </Tabs.Panel>
            </Tabs>
          </Flex>
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

    return result;
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
