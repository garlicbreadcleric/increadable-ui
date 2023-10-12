import { Progress } from "@mantine/core";

export type BookProgressProps = {
  color: string;
  progress: number;
};

export function BookProgress({ color, progress }: BookProgressProps) {
  return (
    <Progress color={color} bg="none" radius={0} bottom={0} value={progress} w="100%" style={{ position: "fixed" }} />
  );
}
