import {
    PropsWithChildren,
    createContext,
    useCallback,
    useEffect,
    useState,
  } from "react";
  
  // Type alias for a record where the keys are wallet identifiers and the values are account
  // addresses or null.
  type SelectedAccountByWallet = Record<string, string | null>;
  
  // Context interface for the EIP-6963 provider.
  interface WalletProviderContextType {
    wallets: Record<string, EIP6963ProviderDetail>; // A list of wallets.
    selectedWallet: EIP6963ProviderDetail | null; // The selected wallet.
    selectedAccount: string | null; // The selected account address.
    errorMessage: string | null; // An error message.
    connectWallet: (walletUuid: string) => Promise<void>; // Function to connect wallets.
    disconnectWallet: () => void; // Function to disconnect wallets.
    clearError: () => void; // Function to clear errors.
  }
  
  // Define the wallet error structure
  interface WalletError extends Error {
    code: number;
  }
  
  // Declare custom event type for EIP6963 provider announcements
  declare global {
    interface WindowEventMap {
      "eip6963:announceProvider": CustomEvent<EIP6963ProviderDetail>;
    }
  }
  
  // Initialize context with default values.
  export const WalletProviderContext = createContext<WalletProviderContextType>({
    wallets: {},
    selectedWallet: null,
    selectedAccount: null,
    errorMessage: null,
    connectWallet: async () => {},
    disconnectWallet: () => {},
    clearError: () => {},
  });
  
  // The WalletProvider component wraps all other components in the dapp.
  export const WalletProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [wallets, setWallets] = useState<Record<string, EIP6963ProviderDetail>>(
      {}
    );
    const [selectedWalletRdns, setSelectedWalletRdns] = useState<string | null>(
      null
    );
    const [selectedAccountByWalletRdns, setSelectedAccountByWalletRdns] =
      useState<SelectedAccountByWallet>({});
    const [errorMessage, setErrorMessage] = useState("");
  
    const clearError = () => setErrorMessage("");
    const setError = (error: string) => setErrorMessage(error);
  
    useEffect(() => {
      const savedSelectedWalletRdns = localStorage.getItem("selectedWalletRdns");
      const savedSelectedAccountByWalletRdns = localStorage.getItem(
        "selectedAccountByWalletRdns"
      );
  
      if (savedSelectedAccountByWalletRdns) {
        setSelectedAccountByWalletRdns(JSON.parse(savedSelectedAccountByWalletRdns));
      }
  
      const onAnnouncement = (event: CustomEvent<EIP6963ProviderDetail>) => {
        setWallets((currentWallets) => ({
          ...currentWallets,
          [event.detail.info.rdns]: event.detail,
        }));
  
        if (
          savedSelectedWalletRdns &&
          event.detail.info.rdns === savedSelectedWalletRdns
        ) {
          setSelectedWalletRdns(savedSelectedWalletRdns);
        }
      };
  
      window.addEventListener("eip6963:announceProvider", onAnnouncement);
      window.dispatchEvent(new Event("eip6963:requestProvider"));
  
      return () =>
        window.removeEventListener("eip6963:announceProvider", onAnnouncement);
    }, []);
  
    const connectWallet = useCallback(
      async (walletRdns: string) => {
        try {
          const wallet = wallets[walletRdns];
          const accounts = (await wallet.provider.request({
            method: "eth_requestAccounts",
          })) as string[];
  
          if (accounts?.[0]) {
            setSelectedWalletRdns(wallet.info.rdns);
            setSelectedAccountByWalletRdns((currentAccounts) => ({
              ...currentAccounts,
              [wallet.info.rdns]: accounts[0],
            }));
  
            localStorage.setItem("selectedWalletRdns", wallet.info.rdns);
            localStorage.setItem(
              "selectedAccountByWalletRdns",
              JSON.stringify({
                ...selectedAccountByWalletRdns,
                [wallet.info.rdns]: accounts[0],
              })
            );
          }
        } catch (error) {
          console.error("Failed to connect to provider:", error);
          const walletError: WalletError = error as WalletError;
          setError(`Code: ${walletError.code} \nError Message: ${walletError.message}`);
        }
      },
      [wallets, selectedAccountByWalletRdns]
    );
  
    const disconnectWallet = useCallback(async () => {
      if (selectedWalletRdns) {
        setSelectedAccountByWalletRdns((currentAccounts) => ({
          ...currentAccounts,
          [selectedWalletRdns]: null,
        }));
  
        const wallet = wallets[selectedWalletRdns];
        setSelectedWalletRdns(null);
        localStorage.removeItem("selectedWalletRdns");
  
        try {
          await wallet.provider.request({
            method: "wallet_revokePermissions",
            params: [{ eth_accounts: {} }],
          });
        } catch (error) {
          console.error("Failed to revoke permissions:", error);
        }
      }
    }, [selectedWalletRdns, wallets]);
  
    const contextValue: WalletProviderContextType = {
      wallets,
      selectedWallet:
        selectedWalletRdns === null ? null : wallets[selectedWalletRdns],
      selectedAccount:
        selectedWalletRdns === null
          ? null
          : selectedAccountByWalletRdns[selectedWalletRdns],
      errorMessage,
      connectWallet,
      disconnectWallet,
      clearError,
    };
  
    return (
      <WalletProviderContext.Provider value={contextValue}>
        {children}
      </WalletProviderContext.Provider>
    );
  };
  