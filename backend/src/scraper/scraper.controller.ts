import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/scrape')
export class ScraperController {
  constructor(private scraperService: ScraperService) {}

  @Post()
  scrape(@Body('url') url: string) {
    if (!url) return { error: 'url is required' };
    return this.scraperService.scrape(url);
  }
}
