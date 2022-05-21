import React from 'react';
import { SnackbarProvider } from "notistack"

export const wrapRootElement = ({ element }) => (
    <SnackbarProvider > { element } </SnackbarProvider>
);
