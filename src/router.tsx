import { BrowserRouter, Route, Routes } from "react-router-dom";

import { NotFoundPage } from "./pages/not-found.page";
import { BookPage } from "./pages/book.page";
import { HomePage } from "./pages/home.page";

export const routes = {
  index: "/",
  book: "book",
};

export const Router = (): JSX.Element => (
  <BrowserRouter>
    <Routes>
      <Route path={routes.index} element={<HomePage />} />
      <Route path={`${routes.book}/:bookId`} element={<BookPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);
