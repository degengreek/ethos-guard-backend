import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { walletClient, account } from '@/lib/viem';
import { parseEther, isAddress } from 'viem';

const MOCK_NFT_ADDRESS = process.env.MOCK_NFT_CONTRACT_ADDRESS as `0x${string}`;

const HEADERS = {
  'Accept': 'application/json',
  'X-Ethos-Client': 'EthosGuard-MVP'
};

const nftAbi = [
  {
    inputs: [{ name: "to", type: "address" }],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }
] as const;

// Helper to fetch Ethos Score using your specific logic
async function fetchEthosScore(handle: string): Promise<number> {
  try {
    const cleanHandle = handle.replace('@', '').trim();

    // Step 1: Search to find user
    const searchUrl = `https://api.ethos.network/api/v1/search?query=${encodeURIComponent(cleanHandle)}`;
    const searchResp = await fetch(searchUrl, { headers: HEADERS });

    if (!searchResp.ok) return 0;

    const searchData = await searchResp.json();
    const results = searchData.data?.values || [];

    // Find exact match
    const exactMatch = results.find((r: any) =>
      r.username?.toLowerCase() === cleanHandle.toLowerCase() &&
      r.primaryAddress &&
      r.primaryAddress !== '0x0000000000000000000000000000000000000000'
    );

    if (!exactMatch) return 0;

    // Step 2: Get score from the result
    return exactMatch.score || 0;
  } catch (e) {
    console.error('Ethos fetch failed:', e);
    return 0;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { twitter_handle, burner_address } = body;

    if (!twitter_handle || !burner_address) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (!isAddress(burner_address)) {
        return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    // 1. Fetch REAL score securely on backend
    const realScore = await fetchEthosScore(twitter_handle);
    console.log(`Verified Score for ${twitter_handle}: ${realScore}`);

    // 2. Upsert User in Supabase
    const { data: user, error: dbError } = await supabase
      .from('users')
      .upsert(
        { twitter_handle, burner_address, ethos_score: realScore },
        { onConflict: 'burner_address' }
      )
      .select()
      .single();

    if (dbError) {
      console.error('Supabase error:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    const results = { user, faucet: 'skipped', mint: 'skipped' };

    if (account) {
        // Faucet
        try {
            const faucetTx = await walletClient.sendTransaction({
                to: burner_address as `0x${string}`,
                value: parseEther('0.01'),
            });
            results.faucet = faucetTx;
        } catch (f) {
            results.faucet = 'failed';
        }

        // Mint
        if (MOCK_NFT_ADDRESS) {
            try {
                const mintTx = await walletClient.writeContract({
                    address: MOCK_NFT_ADDRESS,
                    abi: nftAbi,
                    functionName: 'mint',
                    args: [burner_address as `0x${string}`],
                });
                results.mint = mintTx;
            } catch (m) {
                results.mint = 'failed';
            }
        }
    }

    return NextResponse.json({ success: true, ...results });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}