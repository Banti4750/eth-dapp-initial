import  "./App.css";
import { WalletProvider } from "./hooks/WalletProvider"; // Correct the path based on your file structure
import { WalletList } from "./components/WalletList";
import { SelectedWallet } from "./components/SelectedWallet";
import { WalletError } from "./components/WalletError";

function App() {
  return (
    <WalletProvider>
      {/* Wrap your app in WalletProvider to provide wallet context */}
      <WalletList />
      <hr />
      {/* Uncomment these components when you want to use them */}
       <SelectedWallet />
      <WalletError /> 
    </WalletProvider>
  );
}

export default App;
