import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('api/scrape')
export class ScraperController {
  constructor(private scraperService: ScraperService) {}

  @Post()
  scrape(@Body('url') url: string) {
    if (!url) return { error: 'url is required' };
    return this.scraperService.scrape(url);
  }
}
