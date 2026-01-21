import { NextResponse } from 'next/server';
import { walletClient, account } from '@/lib/viem';
import { parseEther, isAddress } from 'viem';

export async function POST(request: Request) {
  try {
    const { address } = await request.json();

    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: 'Invalid or missing address' }, { status: 400 });
    }

    if (!account) {
        return NextResponse.json({ error: 'Faucet wallet not configured on server' }, { status: 503 });
    }

    try {
        // Send 0.01 ETH
        const hash = await walletClient.sendTransaction({
            to: address,
            value: parseEther('0.01'), 
        });

        return NextResponse.json({ success: true, txHash: hash });
    } catch (txError: any) {
        console.error('Transaction error:', txError);
        return NextResponse.json({ error: 'Transaction failed. ' + txError.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Faucet error:', error);
    return NextResponse.json({ error: error.message || 'Faucet failed' }, { status: 500 });
  }
}
