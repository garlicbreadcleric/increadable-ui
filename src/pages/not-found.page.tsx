import { Anchor, Flex, Paper, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";

import { routes } from "../router";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Flex w="100%" justify="center" p="xl">
      <Paper w="100%" maw={800}>
        <Title order={1} mb="md" style={{ cursor: "pointer" }} onClick={() => navigate(routes.index)}>
          Inc<u>read</u>able
        </Title>
        <Text>
          This page doesn't exist. <Anchor href="/">Go back to home page</Anchor>.
        </Text>
      </Paper>
    </Flex>
  );
}
