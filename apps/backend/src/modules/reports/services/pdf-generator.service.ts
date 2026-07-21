import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  // Helper custom de Handlebars
  constructor() {
    handlebars.registerHelper('increment', (value) => parseInt(String(value), 10) + 1);
  }

  async generatePdfFromTemplate(templateName: string, data: any): Promise<Buffer> {
    this.logger.log(`Generando PDF para plantilla ${templateName}`);

    let browser: puppeteer.Browser | null = null;

    try {
      // 1. Cargar el HTML de la plantilla
      const templatePath = path.join(
        process.cwd(),
        'src',
        'modules',
        'reports',
        'templates',
        `${templateName}.hbs`,
      );
      const templateHtml = fs.readFileSync(templatePath, 'utf8');

      // 2. Compilar e interpolar con Handlebars
      const template = handlebars.compile(templateHtml);
      const htmlContent = template(data);

      // 3. Lanzar Puppeteer
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();

      // Ajustar contenido e inyectar el HTML
      await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

      // 4. Generar el PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          bottom: '20px',
          left: '20px',
          right: '20px',
        },
      });

      // Retorna un Uint8Array (Node.js Buffer is a subclass)
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Error al generar el documento PDF:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
