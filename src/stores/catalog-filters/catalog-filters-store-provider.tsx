import { ReactNode, createContext, useContext, useRef } from 'react';

import { useStore } from 'zustand';

import { createCatalogFiltersStore } from './catalog-filters-store';
import { CatalogFiltersStore } from './types';

export type CatalogFiltersApi = ReturnType<typeof createCatalogFiltersStore>;

export const CatalogFiltersStoreContext = createContext<CatalogFiltersApi | undefined>(undefined);

export interface CatalogFiltersStoreProviderProps {
    children: ReactNode;
}

export const CatalogFiltersStoreProvider = ({ children }: CatalogFiltersStoreProviderProps) => {
    const storeRef = useRef<CatalogFiltersApi | null>(null);
    if (storeRef.current === null) {
        storeRef.current = createCatalogFiltersStore();
    }

    return (
        <CatalogFiltersStoreContext.Provider value={storeRef.current}>{children}</CatalogFiltersStoreContext.Provider>
    );
};

export const useCatalogFiltersStore = <T,>(selector: (store: CatalogFiltersStore) => T): T => {
    const catalogFiltersStoreContext = useContext(CatalogFiltersStoreContext);

    if (!catalogFiltersStoreContext) {
        throw new Error(`useCatalogFiltersStore must be used within CatalogFiltersStoreProvider`);
    }

    return useStore(catalogFiltersStoreContext, selector);
};
