/** @format */

import { configureStore } from "@reduxjs/toolkit";
import treemapSlice from "./reducers/treemapSlice";

export const store = configureStore({
  reducer: {
    treemap: treemapSlice,
  },
  middleware: [],
});
