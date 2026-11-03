import { useContext } from "react";
import ProductContext from "./productContext";

export function useProducts() {
  return useContext(ProductContext);
}