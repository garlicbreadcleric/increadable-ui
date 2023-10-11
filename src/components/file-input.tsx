import { DragEvent, ReactNode, useState } from "react";
import { styled } from "styled-components";

export type FileInputProps = {
  children: ReactNode;
  disabled?: boolean;
  handleFiles: (files: FileList) => void;
};

export function FileInput({ children, disabled = false, handleFiles }: FileInputProps) {
  const [dragActive, setDragActive] = useState(false);

  function onDrag(e: DragEvent<HTMLDivElement>) {
    if (!disabled) {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    if (!disabled) {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files);
      }
    }
  }

  return (
    <FileInputContainer onDragEnter={onDrag} onDragOver={onDrag} onDragLeave={onDrag} onDrop={onDrop}>
      {children}
      {dragActive && <FileInputOverlay>Drop it!</FileInputOverlay>}
    </FileInputContainer>
  );
}

const FileInputContainer = styled.div`
  height: 100vh;
`;

const FileInputOverlay = styled.div`
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  border: 2px gray dashed;
  box-sizing: border-box;
  color: gray;
  display: flex;
  font-size: 3rem;
  height: calc(100vh - 20px);
  justify-content: center;
  left: 10px;
  place-items: center;
  position: fixed;
  top: 10px;
  user-select: none;
  width: calc(100vw - 20px);
`;
