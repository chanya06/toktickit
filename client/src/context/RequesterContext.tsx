import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchActiveRequesters, DevelopmentRequester } from "../api.js";

const LOCAL_STORAGE_KEY = "toktickit_dev_requester_id";

interface RequesterContextType {
  selectedRequester: DevelopmentRequester | null;
  requesters: DevelopmentRequester[];
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean;
  selectRequester: (requester: DevelopmentRequester) => void;
  openSelectorModal: () => void;
  closeSelectorModal: () => void;
  refreshRequesters: () => Promise<void>;
}

const RequesterContext = createContext<RequesterContextType | undefined>(undefined);

export const RequesterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedRequester, setSelectedRequester] = useState<DevelopmentRequester | null>(null);
  const [requesters, setRequesters] = useState<DevelopmentRequester[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const loadRequesters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchActiveRequesters();
      setRequesters(data);

      const savedId = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedId) {
        const found = data.find((r) => r.id === Number(savedId));
        if (found) {
          setSelectedRequester(found);
        } else {
          // If stored ID is invalid or inactive, open modal
          setIsModalOpen(true);
        }
      } else {
        // No saved requester, open modal automatically
        setIsModalOpen(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load development requesters");
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequesters();
  }, []);

  const selectRequester = (requester: DevelopmentRequester) => {
    setSelectedRequester(requester);
    localStorage.setItem(LOCAL_STORAGE_KEY, String(requester.id));
    setIsModalOpen(false);
  };

  const openSelectorModal = () => {
    setIsModalOpen(true);
  };

  const closeSelectorModal = () => {
    // Only allow closing if a requester is already selected
    if (selectedRequester) {
      setIsModalOpen(false);
    }
  };

  return (
    <RequesterContext.Provider
      value={{
        selectedRequester,
        requesters,
        isLoading,
        error,
        isModalOpen,
        selectRequester,
        openSelectorModal,
        closeSelectorModal,
        refreshRequesters: loadRequesters,
      }}
    >
      {children}
    </RequesterContext.Provider>
  );
};

export const useRequester = (): RequesterContextType => {
  const context = useContext(RequesterContext);
  if (!context) {
    throw new Error("useRequester must be used within a RequesterProvider");
  }
  return context;
};
