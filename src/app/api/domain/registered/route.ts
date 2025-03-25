import { NextResponse } from 'next/server';
import { checkDomain } from '../../_services/dns/dns-service';
import prisma from '@/prisma';
import { DomainWithCheckResults } from '../domain-types';

export async function GET() {
  try {
    const registeredDomains = await prisma.domains.findMany({});

    console.log(registeredDomains)

    const domainsWithCheckResults: DomainWithCheckResults[] = []

    for (const domain of registeredDomains) {
        const domainCheckResults = await checkDomain(domain.incomingAddress);
        domainsWithCheckResults.push({
            ...domain,
            checkResults: domainCheckResults,
        });
    }

    return NextResponse.json({ 
      data: domainsWithCheckResults,
      total: domainsWithCheckResults.length
    });

  } catch (err) {
    console.log("Error",err)
    return NextResponse.json(
      { error: 'Failed to retrieve registered domains' }, 
      { status: 500 }
    );
  }
}