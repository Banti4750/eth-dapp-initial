import React, { useEffect, useState } from 'react';
import { useWalletProvider } from "../hooks/useWalletProvider";
import { formatAddress } from "../utils";
import { Network, Alchemy } from 'alchemy-sdk';

const settings = {
  apiKey: 'coyJltgvd-23dJyyt8iJVAnYQgs1TiNb',
  network: Network.ETH_SEPOLIA,
//   network: Network.ETH_MAINNET,
};

// const alchemy = new Alchemy(settings);

export const SelectedWallet: React.FC = () => {
  const { selectedWallet, selectedAccount, disconnectWallet } = useWalletProvider();
  const [balance, setBalance] = useState<string>('0');
  const [error, setError] = useState<string>('');
//   const [currentNetwork, setCurrentNetwork] = useState<Network>(Network.ETH_MAINNET);


  const alchemy = new Alchemy({ apiKey: settings.apiKey, network: settings.network });

  useEffect(() => {
    const fetchBalance = async () => {
      if (selectedAccount) {
        try {
          const weiBalance = await alchemy.core.getBalance(selectedAccount, 'latest');
          setBalance(weiBalance.toString());
        } catch (err) {
          setError('Error fetching balance: ' + (err as Error).message);
        }
      }
    };

    fetchBalance();
  }, [selectedAccount]);

  const etherBalance = parseFloat(balance) / 1e18;

  const containerStyle = {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'system-ui, sans-serif'
  };

  const headerStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '24px',
    textAlign: 'center' as const,
    color: 'white'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '24px',
    marginBottom: '24px'
  };

  const imageContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px'
  };

  const imageStyle = {
    width: '64px',
    height: '64px',
    objectFit: 'contain' as const
  };

  const walletNameStyle = {
    fontSize: '18px',
    fontWeight: '500',
    textAlign: 'center' as const,
    color: '#1f2937',
    marginBottom: '8px'
  };

  const addressStyle = {
    fontSize: '14px',
    textAlign: 'center' as const,
    color: '#6b7280',
    marginBottom: '16px'
  };

  const detailContainerStyle = {
    display: 'grid',
    gap: '8px'
  };

  const detailRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '8px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px',
    color: '#374151'
  };

  const detailLabelStyle = {
    fontWeight: '500'
  };

  const detailValueStyle = {
    color: '#6b7280'
  };

  const errorStyle = {
    color: '#ef4444',
    fontSize: '14px',
    textAlign: 'center' as const,
    marginTop: '8px'
  };

  const buttonStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
   
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '10px 16px',
    borderRadius: '6px',
    border: 'none',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
        backgroundColor: '#dc2626',
    },
};

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>
        {selectedAccount ? "" : "No "}Wallet Selected
      </h2>
      {selectedAccount && selectedWallet && (
        <div>
          <div style={cardStyle}>
            {selectedWallet.info?.icon && (
              <div style={imageContainerStyle}>
                <img 
                  src={selectedWallet.info.icon} 
                  alt={selectedWallet.info.name}
                  style={imageStyle}
                />
              </div>
            )}
            <div style={walletNameStyle}>{selectedWallet.info?.name}</div>
            <div style={addressStyle}>({formatAddress(selectedAccount)})</div>
            <div style={detailContainerStyle}>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>UUID:</span>
                <span style={detailValueStyle}>{selectedWallet.info?.uuid}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>RDNS:</span>
                <span style={detailValueStyle}>{selectedWallet.info?.rdns}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>Balance (Wei):</span>
                <span style={detailValueStyle}>{balance}</span>
              </div>
              <div style={{...detailRowStyle, borderBottom: 'none'}}>
                <span style={detailLabelStyle}>Balance (ETH):</span>
                <span style={detailValueStyle}>{etherBalance.toFixed(6)}</span>
              </div>
            </div>
            {error && <div style={errorStyle}>{error}</div>}
          </div>
          <button 
            onClick={disconnectWallet} 
            style={buttonStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
            }}
          >
            Disconnect Wallet
          </button>

          {/* <button 
            onClick={() => {
              setCurrentNetwork(prev => 
                prev === Network.ETH_MAINNET ? Network.ETH_SEPOLIA : Network.ETH_MAINNET
               
                
              );
              
              setBalance('0'); // Reset balance on network change
            }} 
            style={buttonStyle}
          >
            Switch to {currentNetwork === Network.ETH_MAINNET ? 'Sepolia' : 'Mainnet'}
          </button> */}
        </div>
      )}
    </div>
  );
};

export default SelectedWallet;