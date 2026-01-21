import { NextResponse } from 'next/server';
import { walletClient, account } from '@/lib/viem';
import { isAddress } from 'viem';

const MOCK_NFT_ADDRESS = process.env.MOCK_NFT_CONTRACT_ADDRESS as `0x${string}`;

const abi = [
  {
    inputs: [{ name: "to", type: "address" }],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }
] as const;

export async function POST(request: Request) {
  try {
    const { address } = await request.json();

    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: 'Invalid or missing address' }, { status: 400 });
    }

    if (!account) {
        return NextResponse.json({ error: 'Wallet not configured' }, { status: 503 });
    }

    if (!MOCK_NFT_ADDRESS) {
        return NextResponse.json({ error: 'Mock NFT Contract not configured' }, { status: 503 });
    }

    try {
        const hash = await walletClient.writeContract({
            account,
            address: MOCK_NFT_ADDRESS,
            abi,
            functionName: 'mint',
            args: [address],
        });

        return NextResponse.json({ success: true, txHash: hash });
    } catch (txError: any) {
        console.error('Minting error:', txError);
        return NextResponse.json({ error: 'Minting failed. ' + txError.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
