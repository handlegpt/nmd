import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Types for domain tracking
interface Domain {
  id: string;
  domain_name: string;
  registrar: string;
  purchase_date: string;
  purchase_cost: number;
  renewal_cost: number;
  total_renewal_paid: number;
  next_renewal_date: string;
  status: 'active' | 'for_sale' | 'sold' | 'expired';
  estimated_value: number;
  tags: string[];
  owner_user_id: string;
  created_at: string;
  updated_at: string;
}

interface DomainTransaction {
  id: string;
  domain_id: string;
  type: 'buy' | 'renew' | 'sell' | 'transfer' | 'fee';
  amount: string;
  currency: string;
  date: string;
  notes: string;
}

interface DomainWithTransactions extends Domain {
  domain_transactions: DomainTransaction[];
}

// GET /api/domains - Fetch all domains for a user
export async function GET(request: NextRequest) {
  try {
    
    // Get user from session (you'll need to implement proper auth)
    // For now, we'll use a mock user ID
    const userId = 'mock-user-id';
    
    const { data: domains, error } = await supabase
      .from('domains')
      .select(`
        *,
        domain_transactions (
          id,
          type,
          amount,
          currency,
          date,
          notes
        )
      `)
      .eq('owner_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching domains:', error);
      return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 });
    }

    // Calculate additional metrics for each domain
    const domainsWithMetrics = domains?.map((domain: DomainWithTransactions) => {
      const transactions = domain.domain_transactions || [];
      const totalCost = transactions
        .filter(t => ['buy', 'renew', 'fee'].includes(t.type))
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const totalRevenue = transactions
        .filter(t => t.type === 'sell')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const profit = totalRevenue - totalCost;
      const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
      
      return {
        ...domain,
        total_cost: totalCost,
        total_revenue: totalRevenue,
        profit,
        roi
      };
    });

    return NextResponse.json({ domains: domainsWithMetrics });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/domains - Create a new domain
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      domain_name,
      registrar,
      purchase_date,
      purchase_cost,
      renewal_cost,
      next_renewal_date,
      estimated_value,
      tags
    } = body;

    // Validate required fields
    if (!domain_name || !registrar || !purchase_date || !purchase_cost) {
      return NextResponse.json(
        { error: 'Missing required fields: domain_name, registrar, purchase_date, purchase_cost' },
        { status: 400 }
      );
    }

    // Mock user ID - replace with actual auth
    const userId = 'mock-user-id';

    // Create domain record
    const { data: domain, error: domainError } = await supabase
      .from('domains')
      .insert({
        domain_name,
        registrar,
        purchase_date,
        purchase_cost: parseFloat(purchase_cost),
        renewal_cost: parseFloat(renewal_cost || 0),
        next_renewal_date,
        estimated_value: parseFloat(estimated_value || 0),
        tags: tags || [],
        owner_user_id: userId
      })
      .select()
      .single();

    if (domainError) {
      console.error('Error creating domain:', domainError);
      return NextResponse.json({ error: 'Failed to create domain' }, { status: 500 });
    }

    // Create initial purchase transaction
    const { error: transactionError } = await supabase
      .from('domain_transactions')
      .insert({
        domain_id: domain.id,
        type: 'buy',
        amount: parseFloat(purchase_cost),
        currency: 'USD',
        date: purchase_date,
        notes: 'Initial purchase'
      });

    if (transactionError) {
      console.error('Error creating purchase transaction:', transactionError);
      // Domain was created but transaction failed - we should handle this gracefully
    }

    return NextResponse.json({ domain }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
