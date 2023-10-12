import { Button } from "@mantine/core";
import { IconBookmark } from "@tabler/icons-react";

export type BookmarkButtonProps = { onClick: () => void };

export function BookmarkButton({ onClick }: BookmarkButtonProps) {
  return (
    <Button
      onClick={onClick}
      mb="lg"
      ml="lg"
      p={0}
      w={50}
      h={50}
      bottom={0}
      color="dark"
      style={{ borderRadius: "100%", position: "fixed" }}
    >
      <IconBookmark size="1.5rem" />
    </Button>
  );
}
