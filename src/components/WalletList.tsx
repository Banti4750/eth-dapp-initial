import { useWalletProvider } from "../hooks/useWalletProvider";
import styles from "./WalletList.module.css"; // Ensure you have the CSS module

export const WalletList = () => {
  const { wallets, connectWallet } = useWalletProvider(); // Destructure hook return values

  return (
    <>
      <h2>Wallets Detected:</h2>
      <div className={styles.walletList}>
        {Object.keys(wallets).length > 0 ? ( // Ensure wallets object has keys
          Object.values(wallets).map((provider: EIP6963ProviderDetail) => (
            <button
              key={provider.info.uuid} // Use UUID as key
              onClick={() => connectWallet(provider.info.rdns)} // Use connectWallet with rdns
            >
              <img src={provider.info.icon} alt={provider.info.name} />
              <div>{provider.info.name}</div>
            </button>
          ))
        ) : (
          <div>There are no announced providers</div> // Display message when no wallets are available
        )}
      </div>
    </>
  );
};
