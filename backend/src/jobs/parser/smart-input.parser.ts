import { Injectable } from '@nestjs/common';

interface ParsedInput {
  companyName: string;
  sourceUrl: string | undefined;
  description: string | undefined;
  companyDomain: string | undefined;
}

@Injectable()
export class SmartInputParser {
  parse(input: string, manualCompanyName?: string): ParsedInput {
    const trimmed = input.trim();

    if (this.isUrl(trimmed)) {
      return this.parseUrl(trimmed, manualCompanyName);
    }
    return this.parseText(trimmed, manualCompanyName);
  }

  private isUrl(str: string): boolean {
    return /^https?:\/\//i.test(str) || /^www\./i.test(str);
  }

  private parseUrl(url: string, manualCompanyName?: string): ParsedInput {
    let cleanUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      cleanUrl = 'https://' + url;
    }

    const domain = this.extractDomain(cleanUrl);

    if (domain === undefined) {
      return this.parseText(url, manualCompanyName);
    }

    const companyName =
      manualCompanyName || this.domainToCompanyName(domain) || url;

    return {
      companyName,
      sourceUrl: cleanUrl,
      description: undefined,
      companyDomain: domain,
    };
  }

  private parseText(text: string, manualCompanyName?: string): ParsedInput {
    const companyName =
      manualCompanyName || this.inferCompanyFromText(text);
    return {
      companyName,
      sourceUrl: undefined,
      description: text,
      companyDomain: undefined,
    };
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
