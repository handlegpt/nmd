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

// GET /api/domains/stats - Get domain portfolio statistics
export async function GET(request: NextRequest) {
  try {
    
    // Mock user ID - replace with actual auth
    const userId = 'mock-user-id';
    
    // Get all domains for the user
    const { data: domains, error: domainsError } = await supabase
      .from('domains')
      .select('*')
      .eq('owner_user_id', userId);

    if (domainsError) {
      console.error('Error fetching domains for stats:', domainsError);
      return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 });
    }

    // Get all transactions for the user's domains
    const domainIds = domains?.map((d: Domain) => d.id) || [];
    const { data: transactions, error: transactionsError } = await supabase
      .from('domain_transactions')
      .select('*')
      .in('domain_id', domainIds);

    if (transactionsError) {
      console.error('Error fetching transactions for stats:', transactionsError);
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }

    // Calculate statistics
    const totalDomains = domains?.length || 0;
    
    // Calculate total costs (buy + renew + fees)
    const totalCost = transactions
      ?.filter((t: DomainTransaction) => ['buy', 'renew', 'fee'].includes(t.type))
      .reduce((sum: number, t: DomainTransaction) => sum + parseFloat(t.amount), 0) || 0;
    
    // Calculate total revenue (sales)
    const totalRevenue = transactions
      ?.filter((t: DomainTransaction) => t.type === 'sell')
      .reduce((sum: number, t: DomainTransaction) => sum + parseFloat(t.amount), 0) || 0;
    
    const totalProfit = totalRevenue - totalCost;
    const roi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    
    // Count domains by status
    const statusCounts = domains?.reduce((acc: Record<string, number>, domain: Domain) => {
      acc[domain.status] = (acc[domain.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    // Count domains expiring soon (within 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const expiringSoon = domains?.filter((domain: Domain) => {
      if (!domain.next_renewal_date) return false;
      const renewalDate = new Date(domain.next_renewal_date);
      return renewalDate <= thirtyDaysFromNow && domain.status === 'active';
    }).length || 0;
    
    // Count domains for sale
    const forSale = statusCounts['for_sale'] || 0;
    
    // Calculate total estimated value of active domains
    const totalEstimatedValue = domains
      ?.filter((d: Domain) => d.status === 'active')
      .reduce((sum: number, d: Domain) => sum + (d.estimated_value || 0), 0) || 0;
    
    // Calculate unrealized profit/loss
    const unrealizedPL = totalEstimatedValue - 
      domains?.filter((d: Domain) => d.status === 'active')
        .reduce((sum: number, d: Domain) => {
          const domainTransactions = transactions?.filter((t: DomainTransaction) => t.domain_id === d.id) || [];
          const domainCost = domainTransactions
            .filter((t: DomainTransaction) => ['buy', 'renew', 'fee'].includes(t.type))
            .reduce((costSum: number, t: DomainTransaction) => costSum + parseFloat(t.amount), 0);
          return sum + domainCost;
        }, 0) || 0;
    
    // Registrar distribution
    const registrarDistribution = domains?.reduce((acc: Record<string, number>, domain: Domain) => {
      acc[domain.registrar] = (acc[domain.registrar] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    // TLD distribution
    const tldDistribution = domains?.reduce((acc: Record<string, number>, domain: Domain) => {
      const tld = domain.domain_name.split('.').pop() || 'unknown';
      acc[tld] = (acc[tld] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const stats = {
      totalDomains,
      totalCost,
      totalRevenue,
      totalProfit,
      roi,
      expiringSoon,
      forSale,
      totalEstimatedValue,
      unrealizedPL,
      statusCounts,
      registrarDistribution,
      tldDistribution
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
