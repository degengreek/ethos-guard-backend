'use client';

import { useState } from 'react';
import { createWalletClient, http } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import styles from './page.module.css';

export default function Home() {
  const [handle, setHandle] = useState('');
  const [address, setAddress] = useState('');
  const [score, setScore] = useState(1500);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);

  const generateWallet = () => {
    const pk = generatePrivateKey();
    const account = privateKeyToAccount(pk);
    setAddress(account.address);
    addLog(`Generated new random wallet: ${account.address}`);
  };

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setLogs([]);
    addLog('Starting registration process...');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          twitter_handle: handle,
          burner_address: address,
          ethos_score: Number(score)
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        addLog(`❌ Server Error (${res.status}): ${text.slice(0, 100)}...`);
        return;
      }

      const data = await res.json();
      setResult(data);

      if (data.success) {
        addLog('✅ User saved to Database');
        
        if (data.faucet && typeof data.faucet === 'string' && data.faucet.startsWith('0x')) {
             addLog(`💰 Faucet Sent! Tx: ${data.faucet}`);
        } else if (data.faucet === 'skipped') {
             addLog('⚠️ Faucet skipped (Wallet not configured)');
        } else {
             addLog(`❌ Faucet Failed: ${data.faucet}`);
        }

        if (data.mint && typeof data.mint === 'string' && data.mint.startsWith('0x')) {
             addLog(`🎨 NFT Minted! Tx: ${data.mint}`);
        } else if (data.mint === 'skipped') {
             addLog('⚠️ Minting skipped (Contract/Wallet not configured)');
        } else {
             addLog(`❌ Minting Failed: ${data.mint}`);
        }

      } else {
        addLog(`❌ Error: ${data.error}`);
      }

    } catch (err: any) {
      addLog(`❌ Network Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>EthosGuard Backend Tester</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Use this dashboard to manually test the onboarding flow. 
        It calls <code>POST /api/register</code> which handles DB Sync, Faucet, and Minting.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Form */}
        <div style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '8px' }}>
          <h2 style={{ marginTop: 0 }}>Register User</h2>
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Twitter Handle</label>
              <input 
                type="text" 
                placeholder="@degengreek"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Burner Address
                <button 
                    type="button" 
                    onClick={generateWallet}
                    style={{ marginLeft: '10px', fontSize: '0.8rem', padding: '2px 8px', cursor: 'pointer' }}
                >
                    🎲 Generate Random
                </button>
              </label>
              <input 
                type="text" 
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'monospace' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Ethos Score</label>
              <input 
                type="number" 
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                style={{ 
                    padding: '0.75rem', 
                    background: loading ? '#ccc' : '#0070f3', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                }}
            >
                {loading ? 'Processing...' : '🚀 Onboard User'}
            </button>
          </form>
        </div>

        {/* Right Column: Logs */}
        <div style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '8px', background: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginTop: 0 }}>Live Logs</h2>
          <div style={{ flex: 1, overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.9rem', color: '#333' }}>
            {logs.length === 0 && <span style={{ color: '#999' }}>Waiting for action...</span>}
            {logs.map((log, i) => (
                <div key={i} style={{ marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.25rem' }}>
                    {log}
                </div>
            ))}
          </div>
          
          {result && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #ddd' }}>
                  <strong>Raw Response:</strong>
                  <pre style={{ overflowX: 'auto', fontSize: '0.8rem', background: '#eee', padding: '0.5rem' }}>
                      {JSON.stringify(result, null, 2)}
                  </pre>
              </div>
          )}
        </div>

      </div>
    </div>
  );
}