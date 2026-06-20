import { Injectable } from '@nestjs/common';

interface ParsedInput {
  companyName: string;
  role: string | undefined;
  sourceUrl: string | undefined;
  description: string | undefined;
  companyDomain: string | undefined;
}

@Injectable()
export class SmartInputParser {
  async parse(
    input: string,
    manualCompanyName?: string,
    manualRole?: string,
  ): Promise<ParsedInput> {
    const trimmed = input.trim();

    if (this.isUrl(trimmed)) {
      return this.parseUrl(trimmed, manualCompanyName, manualRole);
    }
    return this.parseText(trimmed, manualCompanyName, manualRole);
  }

  private isUrl(str: string): boolean {
    return /^https?:\/\//i.test(str) || /^www\./i.test(str);
  }

  private async parseUrl(
    url: string,
    manualCompanyName?: string,
    manualRole?: string,
  ): Promise<ParsedInput> {
    let cleanUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      cleanUrl = 'https://' + url;
    }

    const domain = this.extractDomain(cleanUrl);
    if (domain === undefined) {
      return this.parseText(url, manualCompanyName, manualRole);
    }

    const fromUrl = this.extractFromUrlPattern(cleanUrl);
    const scraped = await this.tryScrape(cleanUrl);

    return {
      companyName:
        manualCompanyName ||
        scraped.companyName ||
        fromUrl.companyName ||
        this.domainToCompanyName(domain) ||
        url,
      role: manualRole || scraped.role || fromUrl.role || undefined,
      sourceUrl: cleanUrl,
      description: undefined,
      companyDomain: domain,
    };
  }

  private parseText(
    text: string,
    manualCompanyName?: string,
    manualRole?: string,
  ): ParsedInput {
    const companyName =
      manualCompanyName || this.inferCompanyFromText(text);
    return {
      companyName,
      role: manualRole || undefined,
      sourceUrl: undefined,
      description: text,
      companyDomain: undefined,
    };
  }

  private async tryScrape(
    url: string,
  ): Promise<{ companyName?: string; role?: string }> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });
      clearTimeout(timeout);

      const html = await res.text();
      return this.parseHtml(html, url);
    } catch {
      return {};
    }
  }

  private parseHtml(
    html: string,
    url: string,
  ): { companyName?: string; role?: string } {
    const title = this.extractTitle(html);
    const ogTitle = this.extractMeta(html, 'og:title');
    const ogSite = this.extractMeta(html, 'og:site_name');

    const bestTitle = ogTitle || title;
    if (!bestTitle) {
      return { companyName: ogSite || undefined };
    }

    if (ogSite) {
      return { companyName: ogSite };
    }

    if (url.includes('linkedin.com')) {
      return this.parseLinkedInTitle(bestTitle);
    }

    const parsed = this.parseGenericTitle(bestTitle);
    if (parsed.companyName) return parsed;

    return { companyName: ogSite || undefined };
  }

  private parseLinkedInTitle(
    title: string,
  ): { companyName?: string; role?: string } {
    const cleaned = title.replace(/\s*\|\s*LinkedIn.*$/i, '').trim();

    const atMatch = cleaned.match(/^(.+?)\s+(?:at|@|–|-)\s+(.+)$/i);
    if (atMatch) {
      return { role: atMatch[1].trim(), companyName: atMatch[2].trim() };
    }

    const hiringMatch = cleaned.match(
      /^(?:hiring|we're hiring|join|career)\s+(.+?)\s+(?:at|@|–|-)\s+(.+)$/i,
    );
    if (hiringMatch) {
      return { role: hiringMatch[1].trim(), companyName: hiringMatch[2].trim() };
    }

    return { companyName: cleaned };
  }

  private parseGenericTitle(
    title: string,
  ): { companyName?: string; role?: string } {
    const separators = [/\s+–\s+/, /\s+-\s+/, /\s+at\s+/i, /\s+@\s+/, /\s+\|\s+/];

    for (const sep of separators) {
      const parts = title.split(sep);
      if (parts.length >= 2) {
        const candidates = parts.map((p) => p.trim()).filter(Boolean);
        if (candidates.length >= 2) {
          return {
            role: candidates[0],
            companyName: candidates[1],
          };
        }
      }
    }

    return {};
  }

  private extractTitle(html: string): string | undefined {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match?.[1]?.trim();
  }

  private extractMeta(html: string, property: string): string | undefined {
    const patterns = [
      new RegExp(
        `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
        'i',
      ),
      new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
        'i',
      ),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[1].trim();
    }
    return undefined;
  }

  private extractFromUrlPattern(url: string): {
    companyName?: string;
    role?: string;
  } {
    const urlLower = url.toLowerCase();

    if (urlLower.includes('linkedin.com')) {
      const companyMatch = urlLower.match(/\/company\/([^/?]+)/);
      return {
        companyName: companyMatch
          ? this.decodeSegment(companyMatch[1])
          : undefined,
      };
    }

    const slugPatterns = [
      /careers?\.[^/]+\/(?:jobs?\/)?(.+?)(?:\/|$)/i,
      /jobs?\.\w+\/(?:view\/)?(.+?)(?:\/|\?|$)/i,
      /job\/([\w-]+)/i,
      /position\/([\w-]+)/i,
    ];

    for (const pattern of slugPatterns) {
      const match = url.match(pattern);
      if (match && match[1] && !/^\d+$/.test(match[1])) {
        const slug = match[1]
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        return { role: slug };
      }
    }

    return {};
  }

  private decodeSegment(seg: string): string {
    return seg
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private extractDomain(url: string): string | undefined {
    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        return parts.slice(-2).join('.');
      }
      return hostname;
    } catch {
      return undefined;
    }
  }

  private domainToCompanyName(domain: string | undefined): string | undefined {
    if (!domain) return undefined;
    return domain
      .replace(/\.[^.]+$/, '')
      .split(/[-.]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  private inferCompanyFromText(text: string): string {
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    if (words.length <= 3) {
      return words.join(' ');
    }
    return words.slice(0, 3).join(' ') + '...';
  }
}
