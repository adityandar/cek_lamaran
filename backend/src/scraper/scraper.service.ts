import { Injectable } from '@nestjs/common';

@Injectable()
export class ScraperService {
  async scrape(url: string) {
    const hostname = new URL(url).hostname.replace('www.', '');

    if (hostname.includes('linkedin.com')) return this.scrapeLinkedIn(url);
    if (hostname.includes('kalibrr.com')) return this.scrapeKalibrr(url);
    if (hostname.includes('jobstreet')) return this.scrapeJobstreet(url);
    if (hostname.includes('dealls.com')) return this.scrapeDealls(url);

    return this.scrapeGeneric(url);
  }

  private async fetchHtml(url: string): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        redirect: 'follow',
      });
      clearTimeout(timeout);
      if (!res.ok) return null;
      return res.text();
    } catch {
      return null;
    }
  }

  private extractJsonLd(html: string): any[] {
    const results: any[] = [];
    const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(match[1].trim());
        const items = Array.isArray(parsed) ? parsed : [parsed];
        results.push(...items);
      } catch {}
    }
    return results;
  }

  private extractMeta(html: string, property: string): string | undefined {
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i'),
    ];
    for (const p of patterns) {
      const m = html.match(p);
      if (m) return m[1].trim();
    }
  }

  private extractTitle(html: string): string | undefined {
    const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return m?.[1]?.trim();
  }

  private extractNextData(html: string): any {
    const m = html.match(/<script id="__NEXT_DATA__"[^>]*type="application\/json">([\s\S]*?)<\/script>/i);
    if (!m) return null;
    try {
      return JSON.parse(m[1]);
    } catch {
      return null;
    }
  }

  private async scrapeLinkedIn(url: string) {
    const html = await this.fetchHtml(url);
    if (!html) return { error: 'Failed to fetch page (blocked by LinkedIn)' };

    const jsonld = this.extractJsonLd(html);
    const jobPosting = jsonld.find((j) => j['@type'] === 'JobPosting');

    if (jobPosting) {
      return {
        source: 'jsonld',
        title: jobPosting.title,
        companyName: jobPosting.hiringOrganization?.name,
        location: jobPosting.jobLocation?.address?.addressLocality,
        salaryMin: jobPosting.baseSalary?.value?.minValue
          ? Number(jobPosting.baseSalary.value.minValue)
          : null,
        salaryMax: jobPosting.baseSalary?.value?.maxValue
          ? Number(jobPosting.baseSalary.value.maxValue)
          : null,
        salaryCurrency: jobPosting.baseSalary?.currency,
        description: jobPosting.description?.slice(0, 500),
        employmentType: jobPosting.employmentType,
      };
    }

    return {
      source: 'meta',
      title: this.extractMeta(html, 'og:title') || this.extractTitle(html),
      description: this.extractMeta(html, 'og:description'),
      _debug: { htmlLen: html.length, jsonldCount: jsonld.length },
    };
  }

  private async scrapeKalibrr(url: string) {
    const html = await this.fetchHtml(url);
    if (!html) return { error: 'Failed to fetch page' };

    const nextData = this.extractNextData(html);
    if (nextData?.props?.pageProps?.job) {
      const job = nextData.props.pageProps.job;
      const company = job.company || job.companyInfo || {};
      const salary = job.salaryShown != null ? String(job.salaryShown) : '';
      const salaryMatch = salary ? salary.match(/([\d.,]+)\s*[-–]\s*([\d.,]+)/) : null;
      return {
        source: 'next_data',
        title: job.name || job.title || job.position,
        companyName: company.name || job.companyName,
        description: job.description?.replace(/<[^>]+>/g, '').slice(0, 500),
        location: job.googleLocation || job.location,
        salaryMin: salaryMatch ? Number(salaryMatch[1].replace(/[.,]/g, '')) : (job.maximumSalary ? Number(job.maximumSalary) : null),
        salaryMax: salaryMatch ? Number(salaryMatch[2].replace(/[.,]/g, '')) : null,
        salaryCurrency: job.salaryCurrency,
      };
    }

    const jsonld = this.extractJsonLd(html);
    const jobPosting = jsonld.find((j) => j['@type'] === 'JobPosting');

    if (jobPosting) {
      return {
        source: 'jsonld',
        title: jobPosting.title,
        companyName: jobPosting.hiringOrganization?.name,
        location: jobPosting.jobLocation?.address?.addressLocality,
        description: jobPosting.description?.slice(0, 500),
      };
    }

    return { source: 'meta', title: this.extractTitle(html) };
  }

  private async scrapeJobstreet(url: string) {
    const html = await this.fetchHtml(url);
    if (!html) return { error: 'Failed to fetch page' };

    const jsonld = this.extractJsonLd(html);
    const jobPosting = jsonld.find((j) => j['@type'] === 'JobPosting');

    if (jobPosting) {
      return {
        source: 'jsonld',
        title: jobPosting.title,
        companyName: jobPosting.hiringOrganization?.name,
        location: jobPosting.jobLocation?.address?.addressLocality,
        description: jobPosting.description,
      };
    }

    const reduxMatch = html.match(/window\.SEEK_REDUX_DATA\s*=\s*({)/);
    if (reduxMatch) {
      const start = reduxMatch.index! + reduxMatch[0].length - 1;
      let depth = 1;
      let end = start + 1;
      while (depth > 0 && end < html.length) {
        if (html[end] === '{') depth++;
        else if (html[end] === '}') depth--;
        end++;
      }
      try {
        const state = JSON.parse(html.slice(start, end));
        const jobData = state?.jobdetails?.result?.job || state?.job || state?.results?.jobs?.[0] || {};
        if (jobData.title) {
          return {
            source: 'seek_redux',
            title: jobData.title,
            companyName: jobData.advertiser?.name || jobData.companyName,
            location: jobData.location?.label || jobData.location,
            description: (jobData.content || jobData.content2 || jobData.description || '').replace(/<[^>]+>/g, '').slice(0, 500),
          };
        }
        return { source: 'seek_redux', _debug: 'job_not_found_in_state' };
      } catch {
        return { source: 'seek_redux_parse_error' };
      }
    }

    return { source: 'meta', title: this.extractTitle(html) };
  }

  private async scrapeDealls(url: string) {
    const html = await this.fetchHtml(url);
    if (!html) return { error: 'Failed to fetch page' };

    const jsonld = this.extractJsonLd(html);
    const jobPosting = jsonld.find((j) => j['@type'] === 'JobPosting');
    if (jobPosting) {
      return {
        source: 'jsonld',
        title: jobPosting.title,
        companyName: jobPosting.hiringOrganization?.name,
        description: jobPosting.description?.replace(/<[^>]+>/g, '').slice(0, 500),
        location: jobPosting.jobLocation?.address?.addressLocality,
        employmentType: jobPosting.employmentType,
      };
    }

    const nextData = this.extractNextData(html);
    if (nextData?.props?.pageProps?.job) {
      return { source: 'next_data', data: nextData.props.pageProps.job };
    }

    return { source: 'meta', title: this.extractTitle(html) };
  }

  private async scrapeGeneric(url: string) {
    const html = await this.fetchHtml(url);
    if (!html) return { error: 'Failed to fetch page' };

    const jsonld = this.extractJsonLd(html);

    return {
      source: 'generic',
      title: this.extractTitle(html),
      ogTitle: this.extractMeta(html, 'og:title'),
      ogSiteName: this.extractMeta(html, 'og:site_name'),
      jsonldCount: jsonld.length,
    };
  }
}
